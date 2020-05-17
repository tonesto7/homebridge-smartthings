## v2.3.4

- [REMOVE] Removing Sentry error reporting module prior to submitting plugin for verification under homebridge.

## v2.3.3

- [FIX] Packages updates.

## v2.3.2

- [NEW] Added support for bringing acceleration sensors into homekit as motion sensors.

## v2.3.1

- [FIX] Plugin wasn't sending pluginstatus and enable direct messages to SmartApp, so device events weren't being sent to the plugin
- [NEW] Changed some of the plugin version check logic. I also runs after every device refresh (~1 hour)

## v2.3.0

- [REMOVE] Support for Local Commands removed (It doesn't really speed up anything anyways)
- [NEW] Rate-Limiting of commands (debounce)
- [UPDATE] Command optimizations.
- [NEW] Switched web request library from Request-Promise to Axios.
- [FIX] StatusActive characteristic now reports correctly.
- [FIX] Minor bugfixes and optimizations.

## v2.2.1

- [FIX] Resolved the issue with Window Shades not working #71.
- [FIX] Resolve null Service types issue #74.

## v2.2.0

- [UPDATE] Button logic now generates the push/held actions for every button available on the remote now. Meaning you can select the parent remote and have it show actions for each button on the remote. NOTE: I've noticed that I need to open the home app once after adding the buttons to create the event connection.
- [FIX] Buttons should now work 100% again. Sorry about the issues.
- [FIX] Fixed the cannot read property of 'includes' and '\_events' errors.
- [FIX] Fixed some rare issues with requestPromises on device commands.
- [FIX] Lot's of other minor cleanup.
- [NEW] Direct port is now selected automatically using the direct_port config value as the start point for available port detection.
- [NEW] Logs now alert you when your local ST hub endpoint can't be reached.
- [NEW] Added a new config item to define your ST Community username in the error reporting so if you want me to be able to review your issues.
- [NEW] Added config item to allow you to disable error reporting.
- [UPDATE] Modified the point when the Sentry IO Error collector is loaded so it doesn't collect other plugin exceptions.replace
- [UPDATE] Updated Sentry.IO library to v5.11.1.
- [UPDATE] Changed the plugin to not list every single device loaded from cache and every device updated in the logs. They are only visible when debug option is enabled.
- [REMOVE] Support for Energy and Power capabilities removed (for now).

## v2.1.14 - v2.1.16

- [FIX] Thermostats should now update the state correctly and also auto mode is working again.

## v2.1.13

- [NEW] Added Sentry library to help collect/report anonymous error/exception data (absolutely no person data is shared with the exception of maybe a device label in the logs).
- [FIX] Thermostats should now update the state correctly.
- [FIX] Resolved the issue with Buttons crashing your entire HomeKit Instance.

## v2.1.1 - v2.1.12

- [UPDATE] Updated winston logger from v2 to v3 to help with issues running on Hoobs.
- [UPDATE] Added app id header to all local commands made to ST app so if you have more than one instance of the homebridge smartapp it doesn't start sending events to wrong plugin.
- [UPDATE] Updated the app config to allow setting the local_commands value.

## v2.1.0

- [UPDATE] Refactored the device service and characteristic logic so it's cleaner, more modular, and easier to maintain.
- [NEW] Device services and characteristics are now cleaned up when they are no longer used.
- [FIX] Lot's of fixes for device state updates and device commands.
- [FIX] Button events should now work again.
- [FIX] Updated the Hoobs config file (Plugin will be undergoing review by Hoobs to be certified soon) (@mkellsy)
- [FIX] Added support for AirPurifier & AirQuality (@danielskowronski)
- [FIX] Delays on device event updates resolved. (@devarshi) #33 #40
- [FIX] Thermostat Mode fixes (@torandreroland)
- [FIX] Dozens of other minor bugfixes and tweaks.

## v2.0.5 - v2.0.10

- [FIX] Fixed thermostat temp unit error.
- [FIX] removed token/id validation by default to prevent error with mismatched access_token | app_id.
- [FIX] Other minor bugfixes and tweaks.

## v2.0.4

- [FIX] Fixed AlarmStatus updates not being shown in the Home app when changed from ST side.
- [FIX] Fixed issues with local_commands option.
- [FIX] Fix for Celcius temperature conversions.
- [NEW] Added support for new 'temperature_unit' config option using either the smartapp or config.json file.
- [FIX] Other minor bugfixes and tweaks.

## v2.0.1

- [NEW] Completely rewrote the entire plugin using modern javascript structure.
- [NEW] The code is now much cleaner, easier to update/maintain, and easier for others to follow.
- [NEW] This translates into a faster/leaner and way more stable plugin than previous versions.
- [NEW] The plugin now uses the Homebridge Dynamic platform API, meaning it no longer requires a restart of the Homebridge service for device changes to occur.
- [NEW] The plugin now utilizes the device cache on service restart to prevent losing all of your devices when the plugin fails to start for an extended period of time.
- [NEW] It will now remove devices no longer selected under SmartThings.
- [NEW] Introduced an all-new logging system to provide more insight into issues and status, as well as write them to a file.
- [NEW] I used all of the issues from my existing plugin to repair this new version.
- [NEW] Many, many other bug fixes for devices, commands and many other items.
- [NEW] **_Important NOTICE:_**
- **Due to the changes in the plugin API you can not directly update the plugin from v1, you will need to add as a new accessory and setup your devices/automations/scenes again.
  On a positive note, you can use the same SmartApp instance though as long as you update to the latest code.**
