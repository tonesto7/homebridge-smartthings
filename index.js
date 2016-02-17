var smartthings = require('./lib/smartthingsapi');

var Service, Characteristic, Accessory, uuid, EnergyCharacteristics;

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
	
    //This is how often it does a full refresh
    this.polling_seconds = config["polling_seconds"];
	if (!this.polling_seconds) this.polling_seconds=3600;
    
    //This is how often it polls for subscription data.
	this.update_seconds = config["update_seconds"];
	if (!this.update_seconds) this.update_seconds=1;
    
	this.api = smartthings;
	this.log = log;
	this.deviceLookup = {};
    this.firstpoll = true;
    this.attributeLookup = {}
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
								if (that.firstpoll) that.log("Device Skipped - Group " + accessory.deviceGroup + ", Name " + accessory.name+ ", ID " + accessory.deviceid+", JSON: "+ JSON.stringify(device));
							} else {
								that.log("Device Added - Group " + accessory.deviceGroup + ", Name " + accessory.name + ", ID " + accessory.deviceid)//+", JSON: "+ JSON.stringify(device));
								that.deviceLookup[accessory.deviceid] = accessory;
								foundAccessories.push(accessory);
							}
						}
					}
				}
			}
			if (myList && myList.location) {
				that.temperature_unit = myList.location.temperature_scale;
			}
			
			populateDevices(myList.deviceList);
            } else if (myList.error) {
                that.log ("Error received type " + myList.type+' - '+myList.message)
            } else { 
                that.log ("Invalid Response from API call")}
			if (callback)
				callback(foundAccessories)
            that.firstpoll=false;
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
									"Relative Humidity Measurement","Presence Sensor","Thermostat", "Energy Meter", "Power Meter",
                                    "Thermostat Cooling Setpoint","Thermostat Mode","Thermostat Fan Mode","Thermostat Operating State",
                                    "Thermostat Heating Setpoint","Thermostat Setpoint","Indicator"];
		this.temperature_unit = 'F';
		
		smartthings.init(this.app_url, this.app_id, this.access_token);
		
		this.reloadData(function(foundAccessories) { 
			that.log("Unknown Capabilities: " + JSON.stringify(that.unknownCapabilities));
			callback(foundAccessories);
			setInterval(that.reloadData.bind(that), that.polling_seconds*1000);
			setInterval(that.doIncrementalUpdate.bind(that), that.update_seconds*1000);
		 });
	},
    addAttributeUsage(attribute, deviceid, mycharacteristic) {
        if (!this.attributeLookup[attribute])
            this.attributeLookup[attribute]={};
        if (!this.attributeLookup[attribute][deviceid])
            this.attributeLookup[attribute][deviceid]=[];
        this.attributeLookup[attribute][deviceid].push(mycharacteristic);
    },
	doIncrementalUpdate() {
		var that=this;
		var processIncrementalUpdate = function(data) {
			if (data && data.attributes && data.attributes instanceof Array) {
				for (var i = 0; i < data.attributes.length; i++) {
					var attributeSet = data.attributes[i];
					if (!((that.attributeLookup[attributeSet.attribute])&&(that.attributeLookup[attributeSet.attribute][attributeSet.device]))) return;
					var myUsage = that.attributeLookup[attributeSet.attribute][attributeSet.device];
					if (myUsage instanceof Array) {
						for (var j = 0; j < myUsage.length; j++) {
							var accessory = that.deviceLookup[attributeSet.device];
							if (accessory) {
								accessory.device.attributes[attributeSet.attribute]=attributeSet.value;
								myUsage[j].getValue();
							}
						}
					}		   
				}
			}
		}
        smartthings.getUpdates(processIncrementalUpdate);
	}	
};