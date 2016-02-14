var inherits = require('util').inherits;

var Accessory, Service, Characteristic, uuid, EnergyCharacteristics;

/*
 *   SmartThings Accessory
 */

module.exports = function (oAccessory, oService, oCharacteristic, ouuid) {
    if (oAccessory) {
        Accessory = oAccessory;
        Service = oService;
        Characteristic = oCharacteristic;
        EnergyCharacteristics = require('../lib/customCharacteristics').EnergyCharacteristics(Characteristic)

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
    this.device = device;

    var idKey = 'hbdev:smartthings:' + this.deviceid;
    var id = uuid.generate(idKey);

    Accessory.call(this, this.name, id);
    var that = this;

    //Get the Capabilities List
    for (var index in device.capabilities) {
        if ((platform.knownCapabilities.indexOf(index) == -1) && (platform.unknownCapabilities.indexOf(index) == -1))
            platform.unknownCapabilities.push(index);
    }



    this.deviceGroup = "unknown"; //This way we can easily tell if we set a device group


    if (device.capabilities["Switch Level"] !== undefined) {
        if (device.commands.levelOpenClose) {
            //This is a Window Shade
            this.deviceGroup = "shades"
            this.addService(Service.WindowCovering)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', function (callback) {
                    callback(null, that.device.attributes.level);
                })
                .on('set', function (value, callback) {
                    that.platform.api.runCommand(callback, that.deviceid, "setLevel", { value1: value });
                    //Update the status to show it as done. If it failed, this will revert back during the next update.
                    that.device.attributes.level = value;
                });

            this.addService(Service.WindowCovering)
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', function (callback) {
                    callback(null, that.device.attributes.level);
                });

        } else {
            this.deviceGroup = "lights";
            this.addService(Service.Lightbulb)
                .getCharacteristic(Characteristic.On)
                .on('get', function (callback) {
                    callback(null, that.device.attributes.switch == "on");
                })
                .on('set', function (value, callback) {
                    if (value)
                        that.platform.api.runCommand(callback, that.deviceid, "on");
                    else
                        that.platform.api.runCommand(callback, that.deviceid, "off");
                    //Update the status to show it as done. If it failed, this will revert back during the next update.
                    that.device.attributes.switch = "on";
                });

            this.getService(Service.Lightbulb)
                .getCharacteristic(Characteristic.Brightness)
                .on('get', function (callback) {
                    callback(null, that.device.attributes.level);
                })
                .on('set', function (value, callback) {
                    that.platform.api.runCommand(callback, that.deviceid, "setLevel", {
                        value1: value
                    });
                    //Update the status to show it as done. If it failed, this will revert back during the next update.
                    that.device.attributes.level = value;
                });

            if (device.capabilities["Color Control"] !== undefined) {
                this.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Hue)
                    .on('get', function (callback) {
                        callback(null, that.device.attributes.hue);
                    })
                    .on('set', function (value, callback) {
                        that.platform.api.runCommand(callback, that.deviceid, "setHue", {
                            value1: value
                        });
                        //Update the status to show it as done. If it failed, this will revert back during the next update.
                        that.device.attributes.hue = value;
                    });

                this.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Saturation)
                    .on('get', function (callback) {
                        callback(null, that.device.attributes.saturation);
                    })
                    .on('set', function (value, callback) {
                        that.platform.api.runCommand(callback, that.deviceid, "setSaturation", {
                            value1: value
                        });
                        //Update the status to show it as done. If it failed, this will revert back during the next update.
                        that.device.attributes.saturation = value;
                    });
            }
        }
    }

    if (device.capabilities["Garage Door Control"] !== undefined) {
        this.deviceGroup = "garage_doors";
        this.addService(Service.GarageDoorOpener)
            .getCharacteristic(Characteristic.TargetDoorState)
            .on('get', function (callback) {
                if (that.device.attributes.door == 'closed' || that.device.attributes.door == 'closing')
                    callback(null, Characteristic.TargetDoorState.CLOSED);
                else if (that.device.attributes.door == 'open' || that.device.attributes.door == 'opening')
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

    if (device.capabilities["Thermostat"] !== undefined) {
        this.deviceGroup = "thermostats";
        this
            .addService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on('get', function (callback) {
                //if (that.device.attributes.powered) { //I need to verify this changes when the thermostat clicks on.
                switch (that.device.attributes.thermostatOperatingState) {
                    case "pending cool":
                    case "cooling":
                        callback(null, Characteristic.CurrentHeatingCoolingState.COOL);
                        break;
                    case "pending heat":
                    case "heating":
                        callback(null, Characteristic.CurrentHeatingCoolingState.HEAT);
                        break;
                    default: //The above list should be inclusive, but we need to return something if they change stuff.
                        callback(null, Characteristic.CurrentHeatingCoolingState.OFF);
                        break;
                }
                //} else //For now, powered being false means it is off
                //	callback(null, Characteristic.CurrentHeatingCoolingState.OFF);
            });

        //Handle the Target State
        this
            .getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on('get', function (callback) {
                switch (that.device.attributes.thermostatMode) {
                    case "cool":
                        callback(null, Characteristic.TargetHeatingCoolingState.COOL);
                        break;
                    case "emergency heat":
                    case "heat":
                        callback(null, Characteristic.TargetHeatingCoolingState.HEAT);
                        break;
                    case "auto":
                        callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
                        break;
                    default: //The above list should be inclusive, but we need to return something if they change stuff.
                        callback(null, Characteristic.TargetHeatingCoolingState.OFF);
                        break;
                }
            })
            .on('set', function (value, callback) {
                switch (value) {
                    case Characteristic.TargetHeatingCoolingState.COOL:
                        that.platform.api.runCommand(callback, that.deviceid, "cool");
                        that.device.attributes.thermostatMode = 'cool';
                        break;
                    case Characteristic.TargetHeatingCoolingState.HEAT:
                        that.platform.api.runCommand(callback, that.deviceid, "heat");
                        that.device.attributes.thermostatMode = 'heat';
                        break;
                    case Characteristic.TargetHeatingCoolingState.AUTO:
                        that.platform.api.runCommand(callback, that.deviceid, "auto");
                        that.device.attributes.thermostatMode = 'auto';
                        break;
                    case Characteristic.TargetHeatingCoolingState.OFF:
                        that.platform.api.runCommand(callback, that.deviceid, "off");
                        that.device.attributes.thermostatMode = 'off';
                        break;
                }
            });

        if (device.capabilities["Relative Humidity Measurement"] !== undefined) {
            this
                .getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', function (callback) {
                    callback(null, that.device.attributes.humidity);
                });
        }


        if ((device.capabilities["Smoke Detector"] !== undefined) && (that.device.attributes.smoke)) {
            this.deviceGroup = "dectors";
            this
                .getService(Service.SmokeSensor)
                .getCharacteristic(Characteristic.SmokeDetected)
                .on('get', function (callback) {
                    if (that.device.attributes.smoke == 'clear')
                        callback(null, Characteristic.SmokeDetected.SMOKE_NOT_DETECTED);
                    else
                        callback(null, Characteristic.SmokeDetected.SMOKE_DETECTED);
                });
        }


        if ((device.capabilities["Carbon Monoxide Detector"] !== undefined) && (that.device.attributes.carbonMonoxide)) {
            this.deviceGroup = "dectors";
            this
                .getService(Service.CarbonMonoxideSensor)
                .getCharacteristic(Characteristic.CarbonMonoxideDetected)
                .on('get', function (callback) {
                    if (that.device.attributes.carbonMonoxide == 'clear')
                        callback(null, Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL);
                    else
                        callback(null, Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL);
                });
        }

        this
            .getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', function (callback) {
                if (that.platform.temperature_unit == 'C')
                    callback(null, that.device.attributes.temperature);
                else
                    callback(null, (that.device.attributes.temperature - 32) / 1.8);
            });

        this
.getService(Service.Thermostat)
.getCharacteristic(Characteristic.TargetTemperature)
.on('get', function (callback) {
var target_temp = undefined;
switch (that.device.attributes.thermostatMode) {
case "cool":
target_temp = that.device.attributes.coolingSetpoint;
break;
case "emergency heat":
case "heat":
target_temp = that.device.attributes.heatingSetpoint;
break;
case "auto":
// Choose closest target as single target
var high = that.device.attributes.coolingSetpoint;
var low = that.device.attributes.heatingSetpoint;
var cur = that.device.attributes.temperature;
target_temp = Math.abs(high - cur) < Math.abs(cur - low) ? high : low;
break;
default: //The above list should be inclusive, but we need to return something if they change stuff.
target_temp = (that.device.attributes.heatingSetpoint + that.device.attributes.heatingSetpoint) / 2;
break;
}
if (!target_temp) callback('Unknown');
if (that.platform.temperature_unit == 'C')
callback(null, target_temp);
else
callback(null, (target_temp - 32) / 1.8);
})
.on('set', function (value, callback) {
//Convert the Celsius value to the appropriate unit for Smartthings
var temp_requested = value;
if (that.platform.temperature_unit == 'C')
temp_requested = value;
else
temp_requested = ((value * 1.8) + 32);
//Set the appropriate temperature unit based on the mode
switch (that.device.attributes.thermostatMode) {
case "cool":
that.platform.api.runCommand(callback, that.deviceid, "setCoolingSetpoint", { value1: temp_requested });
that.device.attributes.coolingSetpoint = temp_requested;
break;
case "emergency heat":
case "heat":
that.platform.api.runCommand(callback, that.deviceid, "setHeatingSetpoint", { value1: temp_requested });
that.device.attributes.heatingSetpoint = temp_requested;
break;
case "auto":
// Choose closest target as single target
var high = that.device.attributes.coolingSetpoint;
var low = that.device.attributes.heatingSetpoint;
var cur = that.device.attributes.temperature;
var isHighTemp = Math.abs(high - cur) < Math.abs(cur - low);
if (isHighTemp) {
high = temp_requested;
} else {
low = temp_requested;
}
that.platform.api.runCommand(null, that.deviceid, "setHeatingSetpoint", { value1: low });
that.platform.api.runCommand(callback, that.deviceid, "setCoolingSetpoint", { value1: high });
that.device.attributes.coolingSetpoint = high;
that.device.attributes.heatingSetpoint = low;
break;
default: //The above list should be inclusive, but we need to return something if they change stuff.
if (that.device.attributes.temperature > temp_requested) {
that.platform.api.runCommand(null, that.deviceid, "setCoolingSetpoint", { value1: temp_requested });
that.device.attributes.coolingSetpoint = temp_requested;
that.platform.api.runCommand(callback, that.deviceid, "cool");
} else {
that.platform.api.runCommand(null, that.deviceid, "setHeatingSetpoint", { value1: temp_requested - 0.5 });
that.device.attributes.heatingSetpoint = temp_requested;
that.platform.api.runCommand(callback, that.deviceid, "heat");
}
break;
}
});

        this
            .getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', function (callback) {
                if (platform.temperature_unit == "C")
                    callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
                else
                    callback(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
            });

        this
            .getService(Service.Thermostat)
            .getCharacteristic(Characteristic.HeatingThresholdTemperature)
            .on('get', function (callback) {
                if (that.platform.temperature_unit == 'C')
                    callback(null, that.device.attributes.heatingSetpoint);
                else
                    callback(null, (that.device.attributes.heatingSetpoint - 32) / 1.8);
            })
            .on('set', function (value, callback) {
                //Convert the Celsius value to the appropriate unit for Smartthings
                var temp = value;
                if (that.platform.temperature_unit == 'C')
                    temp = value;
                else
                    temp = ((value * 1.8) + 32);
                that.platform.api.runCommand(callback, that.deviceid, "setHeatingSetpoint", { value1: temp });
                that.device.attributes.heatingSetpoint = temp;
            });

        this
            .getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CoolingThresholdTemperature)
            .on('get', function (callback) {
                if (that.platform.temperature_unit == 'C')
                    callback(null, that.device.attributes.coolingSetpoint);
                else
                    callback(null, (that.device.attributes.coolingSetpoint - 32) / 1.8);
            })
            .on('set', function (value, callback) {
                //Convert the Celsius value to the appropriate unit for Smartthings
                var temp = value;
                if (that.platform.temperature_unit == 'C')
                    temp = value;
                else
                    temp = ((value * 1.8) + 32);
                that.platform.api.runCommand(callback, that.deviceid, "setCoolingSetpoint", { value1: temp });
                that.device.attributes.coolingSetpoint = temp;
            });
    }

    if (device.capabilities["Motion Sensor"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        this.addService(Service.MotionSensor)
            .getCharacteristic(Characteristic.MotionDetected)
            .on('get', function (callback) {
                callback(null, (that.device.attributes.motion == "active"));
            });
    }

    if (device.capabilities["Presence Sensor"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        this.addService(Service.OccupancySensor)
            .getCharacteristic(Characteristic.OccupancyDetected)
            .on('get', function (callback) {
                callback(null, (that.device.attributes.presence == "present"));
            });
    }


    if (device.capabilities["Relative Humidity Measurement"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        this.addService(Service.HumiditySensor)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', function (callback) {
                //Need to add logic to determine if this is in C or F
                callback(null, (that.device.attributes.humidity));
            });
    }

    if (device.capabilities["Temperature Measurement"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        this.addService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', function (callback) {
                if (that.platform.temperature_unit == 'C')
                    callback(null, that.device.attributes.temperature);
                else
                    callback(null, (that.device.attributes.temperature - 32) / 1.8);
            });
    }

    if (device.capabilities["Contact Sensor"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
        this.addService(Service.ContactSensor)
            .getCharacteristic(Characteristic.ContactSensorState)
            .on('get', function (callback) {
                if (that.device.attributes.contact == "closed")
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
                callback(null, that.device.attributes.switch == "on");
            })
            .on('set', function (value, callback) {
                if (value)
                    that.platform.api.runCommand(callback, that.deviceid, "on");
                else
                    that.platform.api.runCommand(callback, that.deviceid, "off");
                //Update the status to show it as done. If it failed, this will revert back during the next update.
                that.device.attributes.switch = "on";
            });

    }

    if (device.capabilities["Energy Meter"] !==undefined) {
        this.deviceGroup='EnergyMeter';
        this.addService(Service.Outlet)
            .addCharacteristic(EnergyCharacteristics.TotalConsumption1)
            .on('get', function (callback) {
                callback(null, that.device.attributes.energy);
            });
        this.getService(Service.Outlet)
            .addCharacteristic(EnergyCharacteristics.CurrentConsumption1)
            .on('get', function (callback) {
                callback(null, that.device.attributes.power);
            });

        
    }

    if (device.capabilities["Acceleration Sensor"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
    }

    if (device.capabilities["Three Axis"] !== undefined) {
        if (this.deviceGroup == 'unknown') this.deviceGroup = "sensor";
    }

    this.loadData(device, this);
}

function loadData(data, myObject) {
    var that=this;
    if (myObject !== undefined) that = myObject;
    if (data !== undefined) {
        for (var i = 0; i < that.services.length; i++) {
            for (var j = 0; j < that.services[i].characteristics.length; j++) {
                that.services[i].characteristics[j].getValue();
            }
        }
    } else {
        this.log.debug("Fetching Device Data")
        this.platform.api.getDevice(this.deviceid, function (data) {
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
