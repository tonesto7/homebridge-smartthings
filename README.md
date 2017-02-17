# homebridge-smartthings

[![npm version](https://badge.fury.io/js/homebridge-smartthings.svg)](https://badge.fury.io/js/homebridge-smartthings)
Current Smartapp version - 0.5.2

If you are upgrading from a prior version, make sure you are using the latest Smartapp.

## Device Updates from SmartThings

SmartThings has requested that this app not poll the server so much to see if there is data. We don't technically poll it enough to violate the posted rate limits, but I've made changes to improve performance with their advice.
There is a new configuration item to control how you receive updates called update_method.
If update_method is not set, "direct" is used.
Full device dumps are always fetched regularly in case something has been missed. This is controlled via the "polling_seconds" configuration option and defaults to once an hour.

### Updates via API
This method fires every x number of seconds when configured.
This option has proven to be reliable over the past year but is being deprecated due to the number of API calls required for realtime updates.
You can control the polling frequency with the "update_seconds" value. The default is changing to 30 seconds to comply with requests from SmartThings developers.
If you set it lower you will get a warning from the app but it will allow you at your own risk of the smartapp being disabled by them.

### Direct Updates
This method is nearly instant.
This option allows the hub to send updates directly to your homebridge-smartthings installation.
The hub must be able to send an http packet to your device so make sure to allow incoming traffic on the applicable port.
The port used for this can be configured by the "direct_port" setting and defaults to 8000.
The program will attempt to determine your IP address automatically, but that can be overridden by "direct_ip" which is useful if you have multiple addresses.
As a note, the hub isn't actual doing any of the processing so if you lose Internet, updates will stop. I'm told it "doesn't currently" support it, so there is hope.

When properly setup, you should see something like this in your Homebridge startup immediately after the PIN:
```
[1/29/2017, 8:28:45 AM] Homebridge is running on port 51826.
[1/29/2017, 8:28:45 AM] [SmartThings] Direct Connect Is Listening On 192.168.0.49:8000
[1/29/2017, 8:28:45 AM] [SmartThings] SmartThings Hub Communication Established
```

### PubNub Updates
This method is nearly instant.
If Direct Updates won't work for you, you can use PubNub as a go-between for the cloud.
The free account with them should work for most installations. If you look at their site, this use counts as 1 device and the messages are counted going and coming so it ends up being 500,000 updates a month on the free account.
If anyone actually has more update than that, I can look at consolidating updates by a timeframe and sending them in batches to reduce the message count used for updates.
This method requires you to give the smartapp your publish key and subscription key for PubNub and the smartapp needs the subscription key. It also requires a channel name.
The subscription key and channel are retrieved from the Smartapp to make sure they are always the same.

## Upgrade Existing Installation

1. Log into your SmartThings account at https://graph.api.smartthings.com/ Then goto "MySmartApps"
2. Click "Update From Repo" and select "homebridge-smartthings".
3. You should see the smartapp listed under "Obsolete". Check the box next to the smart app. Check the box next to Publish. Click Execute Update.
4. Close homebridge, if running.
5. Run "npm update homebridge -g" to make sure homebridge is up to date.
6. Run "npm update homebridge-smartthings -g" to update the smartthings module
 * If you didn't originally install with -g then simple omit that here.
7. Start Homebridge. After displaying the network PIN, it should display "Direct Connect Is Listening On XXX.XXX.XXX.XXX:8000" followed by "SmartThings Hub Communication Established".
 * If it displays Direct Connect is Listening... but not Communications Established then check your computer's local firewall for anything blocking TCP 8000 and make sure the listed IP address is on the same network as the SmartThings Hub.
8. Test the process. Make sure your lights show up in Home. Use the Smartthings app to toggle a light on or off and make sure the change is reflected on the IOS device. The Home app should update the status before you have time to switch from Smartthings back to Home.
9. All done.

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
* If using PubNub for updates, scroll down and enter the Subscription Key, Publish Key and a channel name. The channel can be named anything, but it must match between the SmartApp installation and the config.json for homebridge.
* Tap Done and then Done.

### Homebridge Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-smartthings
3. Update your configuration file. See sample config.json snippet below.

### Config.json Settings

Example of all settings. Not all ssettings are required. Read the breakdown below.
```
	{
	   "platform": "homebridge-smartthings.SmartThings",
    	"name": "SmartThings",
        "app_url": "https://graph.api.smartthings.com:443/api/smartapps/installations/",
        "app_id": "THIS-SHOULD-BE-YOUR-APPID",
        "access_token": "THIS-SHOULD-BE-YOUR-TOKEN",
        "polling_seconds": 3600,
        "update_method": "direct",
        "direct_ip": "192.168.0.45",
        "direct_port": 8000,
        "api_seconds": 30
	}
```
* "platform" and "name"
**_Required_**
 * This information is used by homebridge to identify the plugin and should be the settings above.

* "app_url", "app_id" and "access_token"
**_Required_**
 * To get this information, open SmartThings on your phone, goto "Automation">"SmartApps">"JSON Complete API" and tap on Config
 * The app_url in the example may be different for you.

* "polling_seconds"
**_Optional_** Defaults to 3600
 * Identifies how often to get full updates. At this interval, homebridge-smartthings will request a complete device dump from the API just in case any subscription events have been missed.
 * This defaults to once every hour. I have had it set to daily in my installation with no noticable issues.

* "update_method"
**_Optional_** Defaults to direct
 * See *Device Updates from SmartThings* for more information.
 * Options are: "direct", "pubnub", "api" and a recommended in that order.


* "direct_ip"
**_Optional_** Defaults to first available IP on your computer
 * This setting only applies if update_method is direct.
 * Most installations won't need this, but if for any reason it can't identify your ip address correctly, use this setting to force the IP presented to SmartThings for the hub to send to.

* "direct_port"
**_Optional_** Defaults to 8000
 * This setting only applies if update_method is direct.
 * This is the port that homebridge-smartthings will listen on for traffic from your hub. Make sure your firewall allows incoming traffic on this port from your hub's IP address.

* "api_seconds"
**_Optional_** Defaults to 30
 * This setting only applies if update_method is api.
 * This is how often the api will poll for updates. This update method is not recommended.

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

* 0.5.2
 * [SmartApp] Various fixes to fix flaws in the implementation of the direct feed and optional pubnub feed.

* 0.5.1
 * [Plugin] Fixed default value to be correct for update_method.
 * [Plugin] Added type detection for Water Sensor.


* 0.5.0
 * Add support for PubNub and Direct updates. The legacy method using the API has been somewhat crippled in default settings.
 * [Plugin] Moved switches up in the order so that they switches with temperature sensors on them still add as switches.
 * [SmartApp] Updated icons to come from my own dropbox rather than "some random guy on the internet". The icon has also been changed to be a fusion of the JSON logo and the Smartthings logo.

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
