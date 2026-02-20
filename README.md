# LibreLinkUp gnome-shell Top Bar extension

A gnome-shell extension to show glucose readings from LibreLinkUp in the top bar.

![extension screenshot](https://raw.github.com/gfidente/llu-top-bar-extension/main/screenshot.png)

> This software program is not endorsed by, affiliated with, maintained, authorized, or sponsored by Abbott or Newyu. All product and company names are the registered trademarks of their original owners. The use of any trade name or trademark is for identification and reference purposes only and does not imply any association with the trademark holder of their product brand.

## Overview

This is a simple extension which connects to [LibreLinkUp](https://www.librelinkup.com/) to retrive the latest glucose readings every 60 seconds and show them in the GNOME top bar.

The extension provides for a little configuration screen useful to set the username and password to be used to login on the LibreLinkUp API. You can use the same credentials used also to configure the [Android LibreLinkUp](https://play.google.com/store/apps/details?id=org.nativescript.LibreLinkUp) application.

## Installation

The extension should easy to install via browser navigating to https://extensions.gnome.org/ ; to install it manually instead:

- Clone the repo into the gnome-shell extensions path*
```bash
git clone https://github.com/gfidente/llu-top-bar-extension.git ~/.local/share/gnome-shell/extensions/llu-top-bar-extension@gfidente.github.io
```
- Logout from GNOME and then login again
- Open the Extensions app (or Tweaks app)
- Find the 'LibreLinkUp Top Bar' extension, locate the three dots icon next to its name to open the preferences dialog
- Configure the LibreLinkUp credentials
- Enable the extension

\* By default the directory should be `~/.local/share/gnome-shell/extensions/`; if it doesn't exist, create it.

## Good to know

With every update, the extension will also show (in brackets) how much the reading has changed compared to the previous value. This will be a number prefixed with a `+` or a `-` sign to indicate if the number is increasing or decreasing.

Once enabled and running, if you click on the glucose value in the top bar, a small popup menu will open showing the patient name you are following and the serial number of the sensor in use.

## Limitations

It will only work if you follow a single patient - as it will only show data from the first patient.
