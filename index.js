var smartthings = require('./lib/smartthingsapi');

var Service, Characteristic, Accessory, uuid;

var SmartThingsAccessory;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	Accessory = homebridge.hap.Accessory;
	uuid = homebridge.hap.uuid;

	SmartThingsAccessory = require('./accessories/smartthings')(Accessory, Service, Characteristic, uuid);

	homebridge.registerPlatform("homebridge-smartthings", "SmartThings", SmartThingsPlatform);
};

function SmartThingsPlatform(log, config) {
	// Load Wink Authentication From Config File
	this.app_url = config["app_url"];
	this.app_id = config["app_id"];
	this.access_token = config["access_token"];
	
	this.api = smartthings;
	this.log = log;
	this.deviceLookup = {};
}

SmartThingsPlatform.prototype = {
	reloadData: function (callback) {
		var that = this;
		var foundAccessories = [];
		smartthings.getDevices(function (myList) {
				// success
			var populateDevices = function(devices) {
				for (var i = 0; i < devices.length; i++) {
					var device = devices[i];
					
					var accessory = undefined;
					if (that.deviceLookup[device.deviceid]) {
						accessory = that.deviceLookup[device.deviceid];
						accessory.device = devices[i];
						accessory.loadData();						
					} else {
						accessory = new SmartThingsAccessory(that, device);

						if (accessory != undefined) {
							if ((accessory.services.length<=1)||(accessory.deviceGroup=="unknown")) {
								that.log("Device Skipped - Group " + accessory.deviceGroup + ", Name " + accessory.name+ ", ID " + accessory.deviceid+", JSON: "+ JSON.stringify(device));
							} else {
								that.log("Device Added - Group " + accessory.deviceGroup + ", Name " + accessory.name + ", ID " + accessory.deviceid+", JSON: "+ JSON.stringify(device));
								that.deviceLookup[accessory.deviceid] = accessory;
								foundAccessories.push(accessory);
							}
						}
					}
				}
			}
			if (myList.location) {
				this.temperature_unit = myList.location.temperature_scale;
			}
			
			populateDevices(myList.deviceList);
			if (myList.sensorList && myList.sensorList instanceof Array) {
				populateDevices(myList.sensorList);
			}
			if (callback)
				callback(foundAccessories)
		});
    },
	accessories: function (callback) {
		this.log("Fetching Smart Things devices.");
		
		var that = this;
		var foundAccessories = [];
		this.deviceLookup = [];
		this.unknownCapabilities = [];
		this.knownCapabilities = ["Switch","Color Control","Battery","Polling","Lock","Refresh","Lock Codes","Sensor","Actuator",
									"Configuration","Switch Level","Temperature Measurement","Motion Sensor","Color Temperature",
									"Contact Sensor","Three Axis","Acceleration Sensor","Momentary","Door Control","Garage Door Control",
									"Relative Humidity Measurement","Presence Sensor","Thermostat"];
		this.temperature_unit = 'F';
		this.refresh_seconds = 10;
		
		smartthings.init(this.app_url, this.app_id, this.access_token);
		
		this.reloadData(function(foundAccessories) { 
			that.log("Unknown Capabilities: " + JSON.stringify(that.unknownCapabilities));
			callback(foundAccessories);
			setInterval(that.reloadData.bind(that), that.refresh_seconds*1000);
		 });
	}
		
};