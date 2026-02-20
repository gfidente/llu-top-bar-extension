import GLib from "gi://GLib";
import Soup from "gi://Soup?version=3.0";
import St from "gi://St";
import Clutter from "gi://Clutter";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const LOGIN_URL = "https://api-eu.libreview.io/llu/auth/login";
const DATA_URL = "https://api-eu.libreview.io/llu/connections";

const HEADERS = {
  accept: "application/json",
  "user-agent": "curl/8.18.0",
  "cache-control": "no-cache",
  connection: "keep-alive",
  "content-type": "application/json",
  product: "llu.android",
  version: "4.17.0",
};

export default class LluExtension extends Extension {
  enable() {
    this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
    this._settings = this.getSettings();

    this._button = new St.Label({
      text: "...",
      y_align: Clutter.ActorAlign.CENTER, // without it text appears to be top aligned vertically
    });

    this._menuItem = new PopupMenu.PopupMenuItem("...", {
      reactive: false,
    });

    this._indicator.add_child(this._button);
    this._indicator.menu.addMenuItem(this._menuItem);
    this._indicator.menu.setSourceAlignment(0);

    this._session = new Soup.Session();
    this._session.set_timeout(10);

    this._token = null;
    this._accountId = null;
    this._timeoutId = null;
    this._lastValue = 0;

    Main.panel.addToStatusArea(this.uuid, this._indicator);

    this._updateButton();

    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      60,
      () => {
        this._updateButton();
        return GLib.SOURCE_CONTINUE;
      },
    );
  }

  disable() {
    // In reverse order
    if (this._timeoutId) {
      GLib.Source.remove(this._timeoutId);
      this._timeoutId = null;
    }

    this._session?.abort();
    this._session = null;

    this._menuItem?.destroy();
    this._menuItem = null;

    this._button?.destroy();
    this._button = null;

    this._settings = null;
    this._indicator?.destroy();
    this._indicator = null;
  }

  _getHeaders(auth = false) {
    let headers = { ...HEADERS };
    if (auth && this._token) {
      headers["authorization"] = `Bearer ${this._token}`;
      headers["account-id"] = this._accountId;
    }
    return headers;
  }

  async _updateButton() {
    if (!this._token) {
      await this._login();
    }
    await this._fetchData();
  }

  async _login() {
    const username = this._settings.get_string("username");
    const password = this._settings.get_string("password");

    if (
      !username ||
      !password ||
      (username === "email" && password == "password")
    ) {
      console.warn("LLU: Configure credentials before use");
      this._button.set_text("Configure Credentials");
      return;
    }

    const body = JSON.stringify({
      email: username,
      password: password,
    });

    const message = Soup.Message.new("POST", LOGIN_URL);

    for (const [key, value] of Object.entries(this._getHeaders(false))) {
      message.request_headers.append(key, value);
    }

    message.set_request_body_from_bytes(
      "application/json",
      new GLib.Bytes(body),
    );

    try {
      const bytes = await this._session.send_and_read_async(
        message,
        GLib.PRIORITY_DEFAULT,
        null,
      );

      if (message.status_code !== 200) {
        console.warn(`LLU: Login failed with status ${message.status_code}`);
        this._button.set_text("Login Failed");
        return;
      }

      const responseDecoder = new TextDecoder("utf-8");
      const responseString = responseDecoder.decode(bytes.get_data());
      const json = JSON.parse(responseString);

      if (json.data && json.data.authTicket && json.data.authTicket.token) {
        this._token = json.data.authTicket.token;
        const checksum = new GLib.Checksum(GLib.ChecksumType.SHA256);
        checksum.update(json.data.user.id);
        this._accountId = checksum.get_string();
        console.debug(`LLU: Logged in as ${username}`);
      } else {
        console.warn("LLU: Token not found in response");
        this._button.set_text("Token Not Found");
      }
    } catch (e) {
      console.error(`LLU: Login exception: ${e}`);
      this._button.set_text("Login Exception");
    }
  }

  async _fetchData() {
    if (!this._token) return;

    const message = Soup.Message.new("GET", DATA_URL);

    for (const [key, value] of Object.entries(this._getHeaders(true))) {
      message.request_headers.append(key, value);
    }

    try {
      const bytes = await this._session.send_and_read_async(
        message,
        GLib.PRIORITY_DEFAULT,
        null,
      );

      if (message.status_code === 401) {
        console.warn("LLU: Token appears expired, retrying login");
        this._token = null; // Token expired
        return;
      }

      if (message.status_code !== 200) {
        console.warn(`LLU: Fetch failed ${message.status_code}`);
        this._button.set_text("Fetch Failed");
        return;
      }

      const responseDecoder = new TextDecoder("utf-8");
      const responseString = responseDecoder.decode(bytes.get_data());
      const json = JSON.parse(responseString);

      // Attempt to extract a number from the connection data
      // Typical structure: data[].glucoseMeasurement.ValueInMgPerDl
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const conn = json.data[0];
        const value = conn.glucoseMeasurement.ValueInMgPerDl.toString();
        const diff = this._lastValue == 0 ? 0 : value - this._lastValue;

        let barText = "";
        if (diff < 0) {
          barText = `mg/dl ${value} (${diff})`;
        } else {
          barText = `mg/dl ${value} (+${diff})`;
        }
        const menuText = `Sensor SN: ${conn.sensor.sn}\n${conn.firstName} ${conn.lastName}`;

        this._button.set_text(barText);
        this._menuItem.label.set_text(menuText);
        this._lastValue = value;
        console.debug(`LLU: Latest value read is: ${value}`);
      } else {
        console.warn("LLU: Data invalid");
        this._button.set_text("Data Invalid");
      }
    } catch (e) {
      console.error(`LLU: Parsing error: ${e}`);
      this._button.set_text("Parsing Error");
    }
  }
}
