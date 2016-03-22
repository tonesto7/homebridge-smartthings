# homebridge-smartthings

[![npm version](https://badge.fury.io/js/homebridge-smartthings.svg)](https://badge.fury.io/js/homebridge-smartthings)
Current Smartapp version - 0.4.1

If you are upgrading from a prior version, make sure you are using the latest Smartapp.
If you put polling_seconds in your config.json file, remove it or increase it to a much larger setting.

## Installation

Installation comes in two parts:

### SmartThings API installation
A custom JSON API has been written to interface with Smartthings. If you have any other than the one called "" then you need to install the new one.
This plugin will NOT work with the original "JSON API" due to a lack of features.

If you installed the previous update that doesn't allow selecting devices, you need to goto "My Locations" and then "List Smartapps" to remove the multiple installation.

* Log into your SmartThings account at https://graph.api.smartthings.com/
* Goto "My SmartApps"
* Click on Settings and add the repository with Owner of "pdlove" and name of "homebridge-smartthings" and branch of "master" and then click save.
* Click "Update From Repo" and select "homebridge-smartthings"
* You should have json-complete-api in the New section. Check it, check Publish at the bottom and click "Execute Update".

* Click on the app in the list and then click "App Settings"
* Scroll down to the OAuth section and click "Enable OAuth in Smartapp"
* Select "Update" at the bottom.

* In the SmartThings App, goto "Marketplace" and select "SmartApps". At the bottom of the list, select "My Apps"
* Select "JSON Complete API" from the list.
* Tap the plus next to an appropriate device group and then check off each device you would like to use.
 * There are several categories because of the way Smartthings assigns capabilities.
  * Almost all devices contain the Refresh capability and are under the "Most Devices" group
  * Some sensors don't have a refresh and are under the "Sensor Devices" group.
  * Some devices, mainly Virtual Switches, only have the Switch Capability and are in the "All Switches".
 * If you select the same device in multiple categories it will only be shown once in HomeKit, so you can safely check them all in all groups.
 * If a device isn't listed, let me know by submitting an issue on GitHub.
* Tap Done and then Done.

### Homebridge Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-smartthings
3. Update your configuration file. See sample config.json snippet below.

### Config.json example

	{
	   "platform": "homebridge-smartthings.SmartThings",
    	"name": "SmartThings",
        "app_url": "https://graph.api.smartthings.com:443/api/smartapps/installations/",
        "app_id": "THIS-SHOULD-BE-YOUR-APPID",
        "access_token": "THIS-SHOULD-BE-YOUR-TOKEN",
        "polling_seconds": 600,
        "update_seconds": 1
	}

To get this information, open SmartThings on your phone, goto "My Home">"SmartApps">"JSON Complete API" and tap on Config
polling_seconds is optional and defaults to 60.
update_seconds is optional and defaults to 1. At this speed, updates feel instant, but it can be reduced to 0.5 or increased up to 60.

##Reporting Devices for Development

* The first step is to install the smartapp to the device
 * This is done by opening SmartThings on your phone and going to "My Home">"SmartApps">"JSON Complete API". Tap all devices and make sure it is enabled in the list.
 * If you cannot find the device in this list, please submit an Issue on Github with the make/model of the device. More information will be needed, but that will be a good start.
* The next step is to start Homebridge and watch the first part of the initialization where it says "Device Added"/"Device Skipped"
 * If it says "Device Skipped", copy/paste that entire line to an Issue on Github. It supplies all the information needed to get the device up an working if HomeKit can support it.
 * If it says "Device Added" then the device should appear in HomeKit. If specific function is missing, post the Device Added line and identify what you are missing from it.
* If a large number of similar devices are Skipped or missing functionality, it may just be a Capability that is missing. If so, it will be listed in the "Unknown Capabilities" line item.

##Errors while running

* There have been alot of reports of errors causing issues with homebridge. Alot has been done to try and resolve this. Please post an issue for only this issue if you are incountering it.
* If you receive an "error at req", this is normally caused by network issues and the plugin should always auto-recover. Please verify you have internet access on the device before posting about these. If you get one or two ENOTFOUND errors in the middle of the night, it is probably your modem resetting and is nothing to worry about. 
 
## What's New

* GitHub Current
 * Nothing Additional

* 0.4.7
 * [Plugin] resolved issue where the callback could be called twice. 
 
* 0.4.6
 * [Plugin] Added explicit conversions to numeric for all numbers. When a streamed update would occurs, the value comes back as a string sometimes. This normally isn't an issue because math is done on alot of numbers but people with Celsius temperatures and brightness changes have been notably affected.
 
* 0.4.5
 * [Plugin] Added rounding to ensure all numbers conform to HomeKit's attributes.
 * [Plugin] Increased Homebridge version in npm settings to ensure newer fixes and newer hap-nodejs which, again, has many fixes.
 
* 0.4.4
 * [Plugin] Added code to ensure the callbacks are always called and that invalid results returns errors instead of crashing the process. Previously, the plugin would attempt to process an invalid result which would cause homebridge to have invalid attribute data. 
 
* 0.4.3
 * [Plugin] Adjusted default polling time from 1 hour to 1 minute to correct issue with devices getting lost. I'm still debugging to determine why it isn't working properly set to 1 hour.

* 0.4.1
 * [SmartApp] Fixed accidental changeover to incorrectly using atomicstate.
 * [Plugin] Adjusted Thermostats to get/set the closes temperature when on auto instead of the average.
 * [Plugin] Changed regular updates to use the Smartapps subscription system to reduce the data coming across the Internet and increase the speed of retrieving updates.
 * [Plugin] Changed default polling_seconds to 3600 seconds to do a full refresh every hour.
 * [Plugin] Added new option update_seconds to define how often to poll for subscription updates and set default to 1. This was also tested at 0.5.
 * [Plugin] Fixed full refresh process to properly update the object with the new information.
 * [Plugin] Fixed an error caused because the result from the api was never checked if it was undefined when looking to see if it produced an error.

* 0.4.0
 * [SmartApp] Rolled in the code needed to subscribe to device events and record changes. In addition, if the client hasn't polled for events in a while, it will stop recording events until the client starts polling.

* 0.3.6
 * [SmartApp] Fixed a bug that caused none of the devices to be usable after the initial load.
