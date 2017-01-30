var PubNub = require('pubnub')
var smartthings = require('./lib/smartthingsapi');
var http = require('http')
var os = require('os');

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
	if (!this.polling_seconds) this.polling_seconds = 3600; //Get a full refresh every hour.

	//This is how often it polls for subscription data.
	this.update_method = config["update_method"];
	if (!this.update_method) this.update_method='direct';

	this.update_seconds = config["update_seconds"];
	if (!this.update_seconds) this.update_seconds = 30; //30 seconds is the new default
	if (this.update_method==='api' && this.update_seconds<30) 
		that.log("The setting for update_seconds is lower than the SmartThings recommended value. Please switch to direct or PubNub using a free subscription for real-time updates.");

	this.direct_port = config["direct_port"];
	if (!this.direct_port) this.direct_port = 8000;
	
	this.direct_ip = config["direct_ip"];
	if (!this.direct_ip) this.direct_ip = smartthing_getIP();

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
				var populateDevices = function (devices) {
					for (var i = 0; i < devices.length; i++) {
						var device = devices[i];

						var accessory = undefined;
						if (that.deviceLookup[device.deviceid]) {
							accessory = that.deviceLookup[device.deviceid];
							accessory.loadData(devices[i]);
						} else {
							accessory = new SmartThingsAccessory(that, device);

							if (accessory != undefined) {
								if ((accessory.services.length <= 1) || (accessory.deviceGroup == "unknown")) {
									if (that.firstpoll) that.log("Device Skipped - Group " + accessory.deviceGroup + ", Name " + accessory.name + ", ID " + accessory.deviceid + ", JSON: " + JSON.stringify(device));
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
			} else if ((!myList) || (!myList.error)) {
				that.log("Invalid Response from API call");
			} else if (myList.error) {
				that.log("Error received type " + myList.type + ' - ' + myList.message);
			} else {
				that.log("Invalid Response from API call");
			}
			if (callback)
				callback(foundAccessories)
			that.firstpoll = false;
		});
	},
	accessories: function (callback) {
		this.log("Fetching Smart Things devices.");

		var that = this;
		var foundAccessories = [];
		this.deviceLookup = [];
		this.unknownCapabilities = [];
		this.knownCapabilities = ["Switch", "Color Control", "Battery", "Polling", "Lock", "Refresh", "Lock Codes", "Sensor", "Actuator",
			"Configuration", "Switch Level", "Temperature Measurement", "Motion Sensor", "Color Temperature",
			"Contact Sensor", "Three Axis", "Acceleration Sensor", "Momentary", "Door Control", "Garage Door Control",
			"Relative Humidity Measurement", "Presence Sensor", "Thermostat", "Energy Meter", "Power Meter",
			"Thermostat Cooling Setpoint", "Thermostat Mode", "Thermostat Fan Mode", "Thermostat Operating State",
			"Thermostat Heating Setpoint", "Thermostat Setpoint", "Indicator"];
		this.temperature_unit = 'F';

		smartthings.init(this.app_url, this.app_id, this.access_token);

		this.reloadData(function (foundAccessories) {
			that.log("Unknown Capabilities: " + JSON.stringify(that.unknownCapabilities));
			callback(foundAccessories);
			setInterval(that.reloadData.bind(that), that.polling_seconds * 1000);
			//Initialize Update Mechanism for realtime-ish updates.
			if (that.update_method==='api') //Legacy API method.
				setInterval(that.doIncrementalUpdate.bind(that), that.update_seconds * 1000);

			else if (that.update_method==='pubnub') { //Uses user's PubNub account
				that.api.getSubscriptionService(function(data) {
					pubnub = new PubNub({ subscribeKey : data.pubnub_subscribekey });
					pubnub.addListener({ 
							status: function(statusEvent) { if (statusEvent.category==='PNReconnectedCategory') that.reloadData(null); },
							message: function(message) { that.processFieldUpdate(message.message, that); } });
        			pubnub.subscribe({ channels: [ that.pubnub_channel ] });	
				});
			}

			else if (that.update_method=='direct') { //The Hub sends updates to this module using http
				smartthings_SetupHTTPServer(that);
				smartthings.startDirect(null,that.direct_ip, that.direct_port);
			}
		});
	},
	addAttributeUsage: function(attribute, deviceid, mycharacteristic) {
		if (!this.attributeLookup[attribute])
			this.attributeLookup[attribute] = {};
		if (!this.attributeLookup[attribute][deviceid])
			this.attributeLookup[attribute][deviceid] = [];
		this.attributeLookup[attribute][deviceid].push(mycharacteristic);
	},

	doIncrementalUpdate: function() {
		var that=this;
		smartthings.getUpdates(function(data) { that.processIncrementalUpdate(data, that)});
	},

	processIncrementalUpdate: function(data, that) {
		if (data && data.attributes && data.attributes instanceof Array) {
			for (var i = 0; i < data.attributes.length; i++) {
				that.processFieldUpdate(data.attributes[i], that);

			}
		}
	},

	processFieldUpdate: function(attributeSet, that) {
		//that.log("Processing Update");
		if (!((that.attributeLookup[attributeSet.attribute]) && (that.attributeLookup[attributeSet.attribute][attributeSet.device]))) return;
		var myUsage = that.attributeLookup[attributeSet.attribute][attributeSet.device];
		if (myUsage instanceof Array) {
			for (var j = 0; j < myUsage.length; j++) {
				var accessory = that.deviceLookup[attributeSet.device];
				if (accessory) {
					accessory.device.attributes[attributeSet.attribute] = attributeSet.value;
					myUsage[j].getValue();
				}
			}
		}
	}
};

function smartthing_getIP() {
	var myIP = '';
	var ifaces = os.networkInterfaces();
	Object.keys(ifaces).forEach(function (ifname) {
  		var alias = 0;
		ifaces[ifname].forEach(function (iface) {
    		if ('IPv4' !== iface.family || iface.internal !== false) {
      			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      			return;
    		}
    	myIP = iface.address;
  		});
	});
	return myIP;
}
function smartthings_SetupHTTPServer(mySmartThings) {
	//Get the IP address that we will send to the SmartApp. This can be overridden in the config file.
	
	//Start the HTTP Server
	const server = http.createServer(function(request,response) { 
				smartthings_HandleHTTPResponse(request, response, mySmartThings)});

	server.listen(mySmartThings.direct_port, (err) => {  
  		if (err) {
    		mySmartThings.log('something bad happened', err);
			return '';
  		}
		mySmartThings.log(`Direct Connect Is Listening On ${mySmartThings.direct_ip}:${mySmartThings.direct_port}`);
	})
	return 'good';
}

function smartthings_HandleHTTPResponse(request, response, mySmartThings)  {
	if (request.url=='/initial') 
		mySmartThings.log("SmartThings Hub Communication Established");
if (request.url=='/update') {
		var newChange = { device: request.headers["change_device"],
						  attribute: request.headers["change_attribute"],
						  value: request.headers["change_value"],
						  date: request.headers["chande_date"]};
		mySmartThings.processFieldUpdate(newChange, mySmartThings);
		}
	response.end('OK');
}