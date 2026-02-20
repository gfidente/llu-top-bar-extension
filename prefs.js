import Adw from "gi://Adw";
import Gio from "gi://Gio";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class LluExtensionPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage({
      title: "LLU: Preferences",
      icon_name: "dialog-information-symbolic",
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: "Authentication",
      description: "Configure your LibreLinkUp credentials",
    });
    page.add(group);

    // Username
    const usernameRow = new Adw.EntryRow({
      title: "Username (Email)",
    });
    group.add(usernameRow);

    // Password
    const passwordRow = new Adw.PasswordEntryRow({
      title: "Password",
    });
    group.add(passwordRow);

    window._settings = this.getSettings();
    window._settings.bind(
      "username",
      usernameRow,
      "text",
      Gio.SettingsBindFlags.DEFAULT,
    );
    window._settings.bind(
      "password",
      passwordRow,
      "text",
      Gio.SettingsBindFlags.DEFAULT,
    );
  }
}
