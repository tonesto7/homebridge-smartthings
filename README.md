# homebridge-smartthings

[![npm](https://img.shields.io/npm/v/homebridge-smartthings?style=for-the-badge)](https://www.npmjs.com/package/homebridge-smartthings)
[![npm](https://img.shields.io/npm/dt/homebridge-smartthings?style=for-the-badge)](https://www.npmjs.com/package/homebridge-smartthings)
![npm](https://img.shields.io/npm/dw/homebridge-smartthings?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/tonesto7/homebridge-smartthings?style=for-the-badge)

[![GitHub issues](https://img.shields.io/github/issues/tonesto7/homebridge-smartthings?style=for-the-badge)](https://github.com/tonesto7/homebridge-smartthings/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/tonesto7/homebridge-smartthings?style=for-the-badge)](https://github.com/tonesto7/homebridge-smartthings/pulls)

![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/tonesto7/homebridge-smartthings/master?style=for-the-badge)
![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/tonesto7/homebridge-smartthings?style=for-the-badge)

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/tonesto7/homebridge-smartthings/Node-CI/master?style=for-the-badge)

[![Donate](https://img.shields.io/badge/donate-paypal-green.svg?style=for-the-badge)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVFJTG8H86SK8&source=url)

## About
<p align="left">
  <img width="100" height="100" src="https://raw.githubusercontent.com/tonesto7/homebridge-smartthings/master/images/hb_tonesto7.png">
</p>
V2 of this plugin is a complete rewrite of the homebridge-smartthings-tonesto7 plugin using modern Javascript structure with classes, promises, and arrow functions.

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/tonesto7/homebridge-smartthings?label=Latest%20SmartApp%20Version&sort=semver&style=for-the-badge)

## Credits
Big thanks for @Areson for his help/motivation in rewriting this.

I also wanted to mention the following projects I referenced for inspiration for design and fixes:
* [homebridge-wink3](https://github.com/sibartlett/homebridge-wink3)
* [homebridge-hubconnect-hubitat](https://github.com/danTapps/homebridge-hubitat-hubconnect)

## Change Log:

### SmartThing App:

- See [CHANGELOG](https://github.com/tonesto7/homebridge-smartthings/blob/master/CHANGELOG-app.md)

### Homebridge Plugin:

- See [CHANGELOG](https://github.com/tonesto7/homebridge-smartthings/blob/master/CHANGELOG.md)

#### Direct Updates from SmartThings
 * This method is nearly instant.
 * This option allows the hub to send updates directly to your homebridge-smartthings installation.
 * The hub must be able to send an http packet to your device so make sure to allow incoming traffic on the applicable port.
 * The port used for this can be configured by the `direct_port` setting and defaults to `8000`.
 * The program will attempt to determine your IP address automatically, but that can be overridden by `direct_ip` which is useful if you have multiple addresses.
 * As a note, the hub isn't actual doing any of the processing so if you lose Internet, updates will stop. I'm told it "doesn't currently" support it, so there is hope.

When properly setup, you should see something like this in your Homebridge startup immediately after the PIN:
```
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Devices to Remove: (0) []
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Devices to Update: (40)
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Devices to Create: (0) []
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Total Initialization Time: (2 seconds)
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Unknown Capabilities: ["Power Source"]
[11/25/2019, 4:44:46 PM] [SmartThings-v2] SmartThings DeviceCache Size: (40)
[11/25/2019, 4:44:46 PM] [SmartThings-v2] WebServer Initiated...
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Sending StartDirect Request to SmartThings | SendToLocalHub: (false)
[11/25/2019, 4:44:46 PM] [SmartThings-v2] Direct Connect is Listening On 10.0.0.163:8000
```

# Installation

Installation comes in two parts:

## 1. SmartApp Installation

### Option 1: Automated Install
   Install using my [SmartThings Community Installer](http://thingsthataresmart.wiki/index.php?title=Community_Installer_(Free_Marketplace))

### Option 2: GitHub Integration or Manual Install

_**Note to new SmartThings users:** You must first enable github integration. (If you use github for work you will probably want to set up a new account as it will request access to your private repos). Only after enabling integration will you see the settings button. Non-US users [can set it up here](https://graph-eu01-euwest1.api.smartthings.com/githubAuth/step1)_.

_**Note to users updating from homebridge-smartthings-tonesto7:** You can continue to use the original Homebridge-SmartThings app if you choose, but to keep it aligned with any changes made to the_ `homebridge-smartthings` _plugin, you should consider migrating the app to point to the_ `homebridge-smartthings` _repository instead of the_ `homebridge-smartthings-tonesto7` _repositories._
* Log into your SmartThings account at [SmartThings IDE](https://account.smartthings.com/login)
* Click on **`My SmartApps`**
* Click on Settings and Add the New repository:
   * Owner: `tonesto7`
   * Name: `homebridge-smartthings`
   * Branch: `master`
   * Click **`Save`**
* Click **`Update From Repo`**
   * Select `homebridge-smartthings`
* You should have `homebridge-v2.groovy` in the New section.
   * Check the Box next to `homebridge-v2.groovy`
   * Check **`Publish`** at the bottom
   * Click **`Execute Update`**

* Click on the `homebridge-v2` app in the list:
   * Click **`App Settings`**
   * Scroll down to the OAuth section and click **`Enable OAuth in Smartapp`**
   * Click **`Update`** at the bottom.
   * (If you are upgrading from a previous version of this project, OAuth will likely already be enabled and you can safely disregard this step)

## 2. SmartApp Configuration

* In the [SmartThings Classic Mobile App](https://apps.apple.com/app/smartthings-classic/id590800740), go to `Marketplace` and select `SmartApps`.
* At the bottom of the list, select `My Apps`.
* Select `Homebridge v2` from the choices on the list.
* **Configuring the App:**

   In **`Define Device Types`** there are 8 inputs that can be used to force a device to be discovered as a specific type in HomeKit.
   **NOTE:** Do not select the same device in more that one input. If you select a device here, do not select that same device in the other device inputs on the previous page.

   For any other devices you would like to add that weren't added in the previous step, just tap on the input next to an appropriate device group and then select each device you would like to use. (The same devices can be selected in any of the Sensor, Switch, Other inputs)
    * There are several categories here because of the way SmartThings assigns capabilities. You might not see your device in one, but might in another.
    * Almost all devices contain the Refresh capability and are under the "Other Devices" group.
    * Some sensors don't have a refresh and are under the "Sensor Devices" group.
    * Some devices, mainly Virtual Switches, only have the Switch Capability and are in the "Switch Devices" group.

    **If you select the same device in multiple categories, it will only be shown once in HomeKit. You can safely check them all in all groups, aside from the NOTICE above.**

 * Tap **`Done`**
 * Tap **`Done`**
 You are finished with the App configuration!
 </br>

## 3. Homebridge Plugin Installation:

***NOTICE:*** I highly recommend installing the plugin [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x) to manage your homebridge instance and configs. This will allow you to use the web based form to configure this plugin.

 1. Install homebridge using: `npm i -g homebridge` (For Homebridge Install: [Homebridge Instructions](https://github.com/nfarina/homebridge/blob/master/README.md))
 2. Install SmartThings plugin using: `npm i -g homebridge-smartthings`
 3. Update your configuration file. See sample `config.json` snippet below.

### Config.json Settings Example

#### Example of all settings. Not all settings are required. Read the breakdown below.

```json
   {
      "platform": "SmartThings-v2",
      "name": "SmartThings-v2",
      "app_url": "https://graph.api.smartthings.com:443/api/smartapps/installations/",
      "app_id": "ffc2dd6e-6fa5-48a9-b274-35c4185ed9ac",
      "access_token": "1888d2bc-7792-1114-9f32-e4724e388a26",
      "communityUserName": "tonesto7",
      "direct_ip": "10.0.0.15",
      "direct_port": 8000,
      "temperature_unit": "F",
      "validateTokenId": false,
      "excluded_capabilities": {
         "SMARTTHINGS-DEVICE-ID-1": [
            "Switch",
            "Temperature Measurement"
         ]
      },
      "logConfig": {
         "debug": false,
         "showChanges": true,
         "hideTimestamp": false,
         "hideNamePrefix": false,
         "file": {
            "enabled": true,
            "level": "good"
         }
      }
   }
```


 * `platform` & `name`  _Required_
This information is used by homebridge to identify the plugin and should be the settings above.

 * `app_url` & `app_id` & `access_token`  _Required_
To get this information, open the SmartThings HomebridgeV2 SmartApp in your SmartThings Classic Mobile App, and tap on `View Configuration Data for Homebridge`
**Notice:** The app_url in the example will be different for you.

 * `communityUserName`  _Optional_ | _Default:_ ''
Only needed when you are having issues with the plugin and you want me to be able to identify your reported exception errors.

 * `direct_ip`  _Optional_ | _Default: 'First available IP on your computer'_
Most installations won't need this, but if for any reason it can't identify your ip address correctly, use this setting to force the IP presented to SmartThings for the hub to send to.

 * `direct_port`  _Optional_ | _Default: `8000`_
This is the port that the `homebridge-smartthings` plugin will listen on for traffic from your hub. Make sure your firewall allows incoming traffic on this port from your SmartThings hub IP address to your HomeBridge instance.

 * `temperature_unit`  _Optional_ | _Default: `F`_
This will allow you to define the temp unit to use.  This can also be set in the SmartApp

 * `validateTokenId`  _Optional_ | _Default: `false`_
This forces the plugin to validate the smartthings app token and location with that in the plugin configuration

 * `excluded_capabilities` _Optional_ | _Default: '{}' (None)_
NOTICE: The smartapp offers many inputs to help filter out device capabilities. Only use this if the available inputs don't meet your needs. Specify the SmartThings device by ID and the associated capabilities you want the plugin to ignore.
This prevents a SmartThings device creating unwanted or redundant HomeKit accessories.

 * `logConfig` _Optional_
Define log output format options as well as enable the log file output.

   - `debug` _Optional_ | _Default: `false`_
Enables Debug log output.

   - `showChanges` _Optional_ | _Default: `true`_
Logs device event changes received from SmartThings.

   - `hideTimestamp` _Optional_ | _Default: `false`_
Hides timestamp prefix from console log output.

   - `hideNamePrefix` _Optional_ | _Default: `false`_
Hides pluglin name prefix `[SmartThings-v2]` from console log output

   - `file` _Optional_
Enable log file output and configure options

     - `enabled` _Optional_ | _Default: `false`_
Activates logging to file (homebridge-smartthings.log) stored in the same folder as the homebridge config.json

     - `level` _Optional_ | _Default: `good`_
Defines the log entry levels that are written to the file. `good` (recommended) is the default which will write all necessary entries.

## Frequently Asked Question:

 ***Q:*** Can this support Samsung Washers, Dryers, Window AC, Robot Vacuum's?
***A:*** Not in the way you hoped. There are no characteristics in Homekit to allow it beyond simple On/Off Switches.

 ***Q:*** Can this support Axis Blinds?
***A:*** Maybe, it can support any device that has the windowShade capability and/or level attributes.

## Known Issues:

* When you change capability filters on a device already created under homekit it will not remove the old capabilities from the device (I'm working on this).

## DONATIONS:
<p align="left">
  <img width="200" height="200" src="https://raw.githubusercontent.com/tonesto7/homebridge-smartthings/master/images/donation_qr.png">
</p>

[![PayPal Donations](https://img.shields.io/badge/donate-paypal-green.svg?style=for-the-badge)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVFJTG8H86SK8&source=url)
