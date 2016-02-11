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
	
    this.polling_seconds = config["polling_seconds"];
	if (!this.polling_seconds) this.polling_seconds=10;
	this.api = smartthings;
	this.log = log;
	this.deviceLookup = {};
}

SmartThingsPlatform.prototype = {
	reloadData: function (callback) {
		var that = this;
		var foundAccessories = [];
        this.log.debug("Refreshing All Device Data");
		smartthings.getDevices(function (myList) {
            that.log.debug("Received All Device Data");
				// success
            if (myList && myList.deviceList && myList.deviceList instanceof Array) {
			var populateDevices = function(devices) {
				for (var i = 0; i < devices.length; i++) {
					var device = devices[i];
					
					var accessory = undefined;
					if (that.deviceLookup[device.deviceid]) {
						accessory = that.deviceLookup[device.deviceid];
						accessory.loadData(devices[i]);						
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
            } else if (myList.error) {
                that.log ("Error received type " + myList.type+' - '+myList.message)
            } else { 
                that.log ("Invalid Reponse from API call")}
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
		
		smartthings.init(this.app_url, this.app_id, this.access_token);
		
		this.reloadData(function(foundAccessories) { 
			that.log("Unknown Capabilities: " + JSON.stringify(that.unknownCapabilities));
			callback(foundAccessories);
			setInterval(that.reloadData.bind(that), that.polling_seconds*1000);
		 });
	}
		
};