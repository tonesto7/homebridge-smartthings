var inherits = require('util').inherits;

var Accessory, Service, Characteristic, uuid;

/*
 *   Pod Accessory
 */

module.exports = function (oAccessory, oService, oCharacteristic, ouuid) {
	if (oAccessory) {
		Accessory = oAccessory;
		Service = oService;
		Characteristic = oCharacteristic;
		uuid = ouuid;

		inherits(SmartThingsAccessory, Accessory);
		SmartThingsAccessory.prototype.loadData = loadData;
		SmartThingsAccessory.prototype.getServices = getServices;
	
	}
	return SmartThingsAccessory;
};
module.exports.SmartThingsAccessory = SmartThingsAccessory;

function SmartThingsAccessory(platform, device) {
	
	this.deviceid = device.deviceid;
	this.name = device.name;
	this.platform = platform;
	this.state = {};
	this.device=device;
	
	var idKey = 'hbdev:smartthings:' + this.deviceid;
	var id = uuid.generate(idKey);
	
	Accessory.call(this, this.name, id);
	var that = this;

	//Get the Capabilities List
	for(var index in device.capabilities) {
		if ((platform.knownCapabilities.indexOf(index)==-1) && (platform.unknownCapabilities.indexOf(index)==-1))
			platform.unknownCapabilities.push(index);
	}


	this.deviceGroup = "unknown"; //This way we can easily tell if we set a device group

	if (device.capabilities["Switch Level"] !== undefined) {
		this.deviceGroup = "lights";
		this.addService(Service.Lightbulb)
			.getCharacteristic(Characteristic.On)
			.on('get', function (callback) {
				callback(null, that.device.attributes.switch=="on");
			})
			.on('set', function (value, callback) {
				if (value)
					that.platform.api.runCommand(callback, that.deviceid, "on");
				else
					that.platform.api.runCommand(callback, that.deviceid, "off");
				//Update the status to show it as done. If it failed, this will revert back during the next update.
				that.device.attributes.switch="on";
			});

		this.getService(Service.Lightbulb)
			.getCharacteristic(Characteristic.Brightness)
			.on('get', function (callback) {
				callback(null, that.device.attributes.level);
			})
			.on('set', function (value, callback) {
				that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value});
				//Update the status to show it as done. If it failed, this will revert back during the next update.
				that.device.attributes.level=value;
			});

		if (device.capabilities["Color Control"] !== undefined) {
			this.getService(Service.Lightbulb)
				.getCharacteristic(Characteristic.Hue)
				.on('get', function (callback) {
					callback(null, that.device.attributes.hue);
				})
			.on('set', function (value, callback) {
				that.platform.api.runCommand(callback, that.deviceid, "setHue", { value1: value});
				//Update the status to show it as done. If it failed, this will revert back during the next update.
				that.device.attributes.hue=value;
			});

			this.getService(Service.Lightbulb)
				.getCharacteristic(Characteristic.Saturation)
				.on('get', function (callback) {
					callback(null, that.device.attributes.saturation);
				})
				.on('set', function (value, callback) {
					that.platform.api.runCommand(callback, that.deviceid, "setSaturation", { value1: value});
					//Update the status to show it as done. If it failed, this will revert back during the next update.
					that.device.attributes.saturation=value;
				});
				
		}
	}

	if (device.capabilities["Garage Door Control"] !== undefined) {
		this.deviceGroup = "garage_doors";
		this.addService(Service.GarageDoorOpener)
			.getCharacteristic(Characteristic.TargetDoorState)
			.on('get', function (callback) {
				if (that.device.attributes.door == 'closed' || that.device.attributes.door=='closing')
					callback(null, Characteristic.TargetDoorState.CLOSED);
				else if (that.device.attributes.door == 'open' || that.device.attributes.door=='opening')
					callback(null, Characteristic.TargetDoorState.OPEN);
			})
			.on('set', function (value, callback) {
				if (value == Characteristic.TargetDoorState.OPEN) {
					that.platform.api.runCommand(callback, that.deviceid, "open");
					that.device.attributes.door = "opening";
				} else if (value == Characteristic.TargetDoorState.CLOSED) {
					that.platform.api.runCommand(callback, that.deviceid, "close");
					that.device.attributes.door = "closing";
				}
			});

		this.getService(Service.GarageDoorOpener)
			.getCharacteristic(Characteristic.CurrentDoorState)
			.on('get', function (callback) {
				switch (that.device.attributes.door) {
					case 'open':
						callback(null, Characteristic.TargetDoorState.OPEN);
						break;
					case 'opening':
						callback(null, Characteristic.TargetDoorState.OPENING);
						break;
					case 'closed':
						callback(null, Characteristic.TargetDoorState.CLOSED);
						break;
					case 'closing':
						callback(null, Characteristic.TargetDoorState.CLOSING);
						break;
					default:
						callback(null, Characteristic.TargetDoorState.STOPPED);
						break;
				}
			});

		this.getService(Service.GarageDoorOpener)
			.setCharacteristic(Characteristic.ObstructionDetected, false);
	} 

	if (device.capabilities["Lock"] !== undefined) {
		this.deviceGroup = "locks";
		this.addService(Service.LockMechanism)
			.getCharacteristic(Characteristic.LockCurrentState)
		.on('get', function (callback) {
			switch (that.device.attributes.lock) {
				case 'locked':
					callback(null, Characteristic.LockCurrentState.SECURED);
					break;
				case 'unlocked':
					callback(null, Characteristic.LockCurrentState.UNSECURED);
					break;
				default:
					callback(null, Characteristic.LockCurrentState.UNKNOWN);
					break;
			}
		});

	this
		.getService(Service.LockMechanism)
		.getCharacteristic(Characteristic.LockTargetState)
		.on('get', function (callback) {
			switch (that.device.attributes.lock) {
				case 'locked':
					callback(null, Characteristic.LockCurrentState.SECURED);
					break;
				case 'unlocked':
					callback(null, Characteristic.LockCurrentState.UNSECURED);
					break;
				default:
					callback(null, Characteristic.LockCurrentState.UNKNOWN);
					break;
			}
		})
		.on('set', function (value, callback) {
			switch (value) {
				case Characteristic.LockTargetState.SECURED:
					that.platform.api.runCommand(callback, that.deviceid, "lock");
					that.device.attributes.lock = "locked";
					break;
				case Characteristic.LockTargetState.UNSECURED:
					that.platform.api.runCommand(callback, that.deviceid, "unlock");
					that.device.attributes.lock = "unlocked";
					break;
			}
		});
	}
	if (device.capabilities["Motion Sensor"] !== undefined) {
		this.deviceGroup = "sensor";
		this.addService(Service.MotionSensor)
			.getCharacteristic(Characteristic.MotionDetected)
			.on('get', function (callback) {
				callback(null, (that.device.attributes.motion=="active"));
			});
	}

	if (device.capabilities["Temperature Measurement"] !== undefined) {
		this.deviceGroup = "sensor";
		this.addService(Service.TemperatureSensor)
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', function (callback) {
				//Need to add logic to determine if this is in C or F
				callback(null, (that.device.attributes.temperature-32)/1.8);
			});
	}

	if (device.capabilities["Contact Sensor"] !== undefined) {
		this.deviceGroup = "sensor";
		this.addService(Service.ContactSensor)
			.getCharacteristic(Characteristic.ContactSensorState)
			.on('get', function (callback) {
				if (that.device.attributes.motion=="closed")
					callback(null, Characteristic.ContactSensorState.CONTACT_DETECTED);
				else
					callback(null, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);

			});
	}

	if (device.capabilities["Battery"] !== undefined) {
		this.addService(Service.BatteryService)
			.getCharacteristic(Characteristic.BatteryLevel)
			.on('get', function (callback) {
				callback(null, that.device.attributes.battery);
			});

		this.getService(Service.BatteryService)
			.getCharacteristic(Characteristic.StatusLowBattery)
			.on('get', function (callback) {
				if (that.device.attributes.battery < 0.20)
					callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
				else
					callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
			});

		this.getService(Service.BatteryService)
			.setCharacteristic(Characteristic.ChargingState, Characteristic.ChargingState.NOT_CHARGING);

	}

	if (device.capabilities["Switch"] !== undefined && this.deviceGroup == "unknown") {
		this.deviceGroup = "switch";
		this.addService(Service.Switch)
			.getCharacteristic(Characteristic.On)
			.on('get', function (callback) {
				callback(null, that.device.attributes.switch=="on");
			})
			.on('set', function (value, callback) {
				if (value)
					that.platform.api.runCommand(callback, that.deviceid, "on");
				else
					that.platform.api.runCommand(callback, that.deviceid, "off");
				//Update the status to show it as done. If it failed, this will revert back during the next update.
				that.device.attributes.switch="on";
			});

	}
	
	if (device.capabilities["Acceleration Sensor"] !== undefined) {
		this.deviceGroup = "sensor";
	}

	if (device.capabilities["Three Axis"] !== undefined) {
		this.deviceGroup = "sensor";
	}
	
	this.loadData(device, this);	
}

	function loadData(data, myObject) {
		if (myObject !== undefined) that=myObject;
		if (data !== undefined) {
			this.device = data;
			for (var i = 0; i < that.services.length; i++) {
				for (var j = 0; j < that.services[i].characteristics.length; j++) {
					that.services[i].characteristics[j].getValue();
				}
			}
		} else {
			var that = this;
			this.platform.api.getDevice(this.deviceid,function(data) { 
				if (data === undefined) return;
				this.device = data;
				for (var i = 0; i < that.services.length; i++) {
					for (var j = 0; j < that.services[i].characteristics.length; j++) {
						that.services[i].characteristics[j].getValue();
					}
				}
			});			
		}
	}

	function getServices() {
	return this.services;
	}
