A gnome-shell extension to show glucose readings from LibreLinkUp in the top bar

# Overview

This is a simple extension which connects to [LibreLinkUp](https://www.librelinkup.com/) to retrive the latest glucose readings every 60 seconds and show them in the GNOME top bar.

The extension provides for a little configuration screen useful to set the username and password to be used to login on the LibreLinkUp API. You can use the same credentials used also to configure the [Android LibreLinkUp](https://play.google.com/store/apps/details?id=org.nativescript.LibreLinkUp) application.

## Installation

The extension should easy to install via browser navigating to https://extensions.gnome.org/ ; to install it manually instead:

- Download a zip/tarball from the github "Releases" section
- Extract it in a directory named `llu-top-bar-extension@gfidente.github.com`
- Move such directory to the GNOME extensions folder*
- Logout from GNOME and then login again
- Open the Extensions app (or Tweaks app)
- Find the 'LibreLinkUp Top Bar' extension, locate the three dots icon next to its name to open the preferences dialog
- Configure the LibreLinkUp credentials
- Enable the extension

\* Default folder should be `~/.local/share/gnome-shell/extensions/`; if it doesn't exist, create it.

## Good to know

With every update, the extension will also show (in brackets) how much the reading has changed compared to the previous value. This will be a number prefixed with a `+` or a `-` sign to indicate if the number is increasing or decreasing.

Once enabled and running, if you click on the glucose value in the top bar, a small popup menu will open showing the patient name you are following and the serial number of the sensor in use.

## Limitations

It will only work if you follow a single patient - as it will only show data from the first patient.
