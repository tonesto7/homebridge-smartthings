# homebridge-smartthings

This is under active development. ETA on first npm release is 02/06/2016. Usuable code should be on here this weekend.

## Installation

Installation comes in two parts:

### SmartThings API installation
A custom JSON API has been written to interface with Smartthings. If you have any other than the one called "" then you need to install the new one.
This plugin will NOT work with the original "JSON API" due to a lack of features.

* Log into your SmartThings account at https://graph.api.smartthings.com/
* Goto "My SmartApps"
* Click on Settings and add the repository with Owner of "pdlove" and name of "homebridge-smartthings" and branch of "master" and then click save.
* Click "Update From Repo" and select "homebridge-smartthings"
* You should have json-complete-api in the New section. Check it, check Publish at the bottom and click "Execute Update".


* In the SmartThings App, goto "Marketplace" and select "SmartApps". At the bottom of the list, select "My Apps"
* Select "JSON Complete API" from the list.
* Tap the plus next to All Devices and then check off each device you would like to use. 
 * If a device isn't listed, let me know by submitting an issue on GitHub.
* Tap Done and then Done.

### Homebridge Installation

This will be covered when I get the plugin for Homebridge Uploaded

## Notes on the API