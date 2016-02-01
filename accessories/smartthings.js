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

	this.deviceGroup = "unknown"; //This way we can easily tell if we set a device group

	if (device.capabilities["Switch Level"] !== undefined) {
		this.deviceGroup = "light";
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
			});

		this.getService(Service.Lightbulb)
			.getCharacteristic(Characteristic.Brightness)
			.on('get', function (callback) {
				callback(null, that.device.attributes.level);
			})
			.on('set', function (value, callback) {
				that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value});
			});

		if (device.capabilities["Color Control"] !== undefined) {
			this.getService(Service.Lightbulb)
				.getCharacteristic(Characteristic.Hue)
				.on('get', function (callback) {
					callback(null, that.device.attributes.hue);
				})
			.on('set', function (value, callback) {
				that.platform.api.runCommand(callback, that.deviceid, "setHue", { value1: value});
			});

			this.getService(Service.Lightbulb)
				.getCharacteristic(Characteristic.Saturation)
				.on('get', function (callback) {
					callback(null, that.device.attributes.saturation);
				})
				.on('set', function (value, callback) {
					that.platform.api.runCommand(callback, that.deviceid, "setSaturation", { value1: value});
				});
				
		}
	}

	if (device.capabilities["Garage Door Control"] !== undefined) {
		this.deviceGroup = "garage_door";
		this.addService(Service.GarageDoorOpener)
			.getCharacteristic(Characteristic.TargetDoorState)
			.on('get', function (callback) {
				if (that.device.attributes == 'closed' || that.device.attributes.door=='closing')
					callback(null, Characteristic.TargetDoorState.CLOSED);
				else if (that.device.attributes.door == 'open' || that.device.attributes.door=='opening')
					callback(null, Characteristic.TargetDoorState.OPEN);
			})
			.on('set', function (value, callback) {
				if (value == Characteristic.TargetDoorState.OPEN)
					that.platform.api.runCommand(callback, that.deviceid, "open");
				else if (value == Characteristic.TargetDoorState.CLOSED)
					that.platform.api.runCommand(callback, that.deviceid, "close");
			});

		this.getService(Service.GarageDoorOpener)
			.getCharacteristic(Characteristic.CurrentDoorState)
			.on('get', function (callback) {
				switch (that.device.attributes) {
					case 'open':
						callback(null, Characteristic.TargetDoorState.OPEN);
						break;
					case 'opening':
						callback(null, Characteristic.TargetDoorState.OPENING);
						break;
					case 'close':
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
		this.deviceGroup = "lock";
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
					break;
				case Characteristic.LockTargetState.UNSECURED:
					that.platform.api.runCommand(callback, that.deviceid, "unlock");
					break;
			}
		});
	}
	if (device.capabilities["Motion Sensor"] !== undefined) {
		this.deviceGroup = "sensor";
	}

	if (device.capabilities["Temperature Measurement"] !== undefined) {
		this.deviceGroup = "sensor";
	}

	if (device.capabilities["Acceleration Sensor"] !== undefined) {
		this.deviceGroup = "sensor";
	}

	if (device.capabilities["Contact Sensor"] !== undefined) {
		this.deviceGroup = "sensor";
	}

	if (device.capabilities["Three Axis"] !== undefined) {
		this.deviceGroup = "sensor";
	}

	if (device.capabilities["Battery"] !== undefined) {
		
	}

	if (device.capabilities["Switch"] !== undefined && this.deviceGroup == "unknown") {
		this.deviceGroup = "switch";
	}
	if (this.deviceGroup == "unknown") {
		this.deviceGroup = "unknown";	
	}		
}

	
	
	function loadData() {
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

	function getServices() {
	return this.services;
	}
