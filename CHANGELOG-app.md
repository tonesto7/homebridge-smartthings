# Changelog

## v2.3.3

- [FIX] Minor bugs and icons squashed.

## v2.3.2

- [NEW] Added support for bringing acceleration sensors into homekit as motion sensors.
- [FIX] Fixed issue with new Garage and Thermostat define type inputs from actually bringing in the devices.

## v2.3.1

- [FIX] Typo `?.` in code preventing saving in IDE.
- [NEW] Fixed new version info when using beta version of plugin.

## v2.3.0

- [REMOVE] Support for Local Commands removed (It doesn't really speed up anything anyways)
- [NEW] Added garage door, thermostat inputs to define device types
- [FIX] Minor bugfixes and optimizations.

## v2.2.1

- [FIX] Minor tweaks to support shades fixes in the plugin.

## v2.2.0

- [UPDATE] Added support for passing the pressed button number when provided.
- [FIX] Other minor bugfixes and optimizations.
- [REMOVE] Support for Energy and Power capabilities removed (for now).

## v2.1.1

- [UPDATE] The app now validates the appId on all local commands made to ST app so if you have more than one instance of the homebridge smartapp it doesn't start sending events to wrong plugin.

## v2.1.0

- [NEW] Added a Device Event and Command history page to review events and commands sent and received by the plugin.
- [UPDATE] Cleaned up some of the unnecessary attributes from the subscription logic.
- [FIX] Refactored the accessToken logic to be more consistent. #38
- [UPDATE] Modified the device event subscription process to reduce timeouts.
- [FIX] Other bug fixes, cleanups, and optimizations.

## v2.0.3

- [NEW] Added a new device data input where you can select a device and see all available attributes, capabilities, commands, and the last 30 events.
- [FIX] Other bug fixes and cleanups.

## v2.0.1

- [UPDATE] Reworked and cleaned up the UI so it's now more organized and easier to follow.
- [NEW] Added new capability filter options.
- [UPDATE] Optimized the command/event streaming system to perform faster and more reliably.
- [NEW] Added duplicate device detection cleanups so Homekit doesn't try to create duplicate devices and throw an error.
- [FIX] Many, many other bug fixes and cleanups.
