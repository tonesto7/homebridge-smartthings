# homebridge-smartthings

Current npm version - 0.3.5
Current Smartapp version - 0.3.6

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
* Tap the plus next to All Devices and then check off each device you would like to use. 
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
        "polling_seconds": 10
	} 

To get this information, open SmartThings on your phone, goto "My Home">"SmartApps">"JSON Complete API" and tap on Config
polling_seconds is optional and defaults to 10. Smartthings can produce Rate Limit errors less than 5 seconds.

##Reporting Devices for Development

* The first step is to install the smartapp to the device
 * This is done by opening SmartThings on your phone and going to "My Home">"SmartApps">"JSON Complete API". Tap all devices and make sure it is enabled in the list.
 * If you cannot find the device in this list, please submit an Issue on Github with the make/model of the device. More information will be needed, but that will be a good start.
* The next step is to start Homebridge and watch the first part of the initialization where it says "Device Added"/"Device Skipped"
 * If it says "Device Skipped", copy/paste that entire line to an Issue on Github. It supplies all the information needed to get the device up an working if HomeKit can support it.
 * If it says "Device Added" then the device should appear in HomeKit. If specific function is missing, post the Device Added line and identify what you are missing from it.
* If a large number of similar devices are Skipped or missing functionality, it may just be a Capability that is missing. If so, it will be listed in the "Unknown Capabilities" line item.

## What's New
I should have started this a while back, but didn't think to. I'll start keeping this updated.

* 0.3.6 
 * [SmartApp] Fixed a bug that caused none of the devices to be usable after the initial load.
