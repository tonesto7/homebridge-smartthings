var Characteristic;
var CommunityTypes;

module.exports = class Transforms {
    constructor(platform, char) {
        this.accessories = platform;
        this.platform = platform.mainPlatform;
        this.client = platform.client;
        Characteristic = char;
        CommunityTypes = platform.CommunityTypes;
        this.log = platform.log;
    }

    transformStatus(val) {
        val = val.toLowerCase() || undefined;
        switch (val) {
            case "online":
            case "active":
                return true;
            default:
                return false;
        }
    }

    transformAttributeState(attr, val, charName) {
        switch (attr) {
            case "switch":
                return (val === 'on');
            case "door":
                switch (val) {
                    case "open":
                        return Characteristic.TargetDoorState.OPEN;
                    case "opening":
                        return charName && charName === "Target Door State" ? Characteristic.TargetDoorState.OPEN : Characteristic.TargetDoorState.OPENING;
                    case "closed":
                        return Characteristic.TargetDoorState.CLOSED;
                    case "closing":
                        return charName && charName === "Target Door State" ? Characteristic.TargetDoorState.CLOSED : Characteristic.TargetDoorState.CLOSING;
                    default:
                        return charName && charName === "Target Door State" ? Characteristic.TargetDoorState.OPEN : Characteristic.TargetDoorState.STOPPED;
                }

            case "fanMode":
                switch (val) {
                    case "low":
                        return CommunityTypes.FanOscilationMode.LOW;
                    case "medium":
                        return CommunityTypes.FanOscilationMode.MEDIUM;
                    case "high":
                        return CommunityTypes.FanOscilationMode.HIGH;
                    default:
                        return CommunityTypes.FanOscilationMode.SLEEP;
                }

            case "lock":
                switch (val) {
                    case "locked":
                        return Characteristic.LockCurrentState.SECURED;
                    case "unlocked":
                        return Characteristic.LockCurrentState.UNSECURED;
                    default:
                        return Characteristic.LockCurrentState.UNKNOWN;
                }

            case "button":
                switch (val) {
                    case "pushed":
                        return Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
                    case "held":
                        return Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
                    case "double":
                        return Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS;
                    default:
                        return null;
                }
            case "supportedButtonValues":
                var validValues = [];
                if (typeof val === "string") {
                    for (const v of JSON.parse(val)) {
                        switch (v) {
                            case "pushed":
                                validValues.push(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                                continue;
                            case "double":
                                validValues.push(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
                                continue;
                            case "held":
                                validValues.push(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                                continue;
                            default:
                                validValues.push(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                                validValues.push(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                                continue;
                        }
                    }
                } else {
                    validValues.push(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                    validValues.push(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                }
                return validValues;
            case "fanState":
                return (val === "off") ? Characteristic.CurrentFanState.IDLE : Characteristic.CurrentFanState.BLOWING_AIR;
            case "valve":
                return (val === "open") ? Characteristic.InUse.IN_USE : Characteristic.InUse.NOT_IN_USE;
            case "mute":
                return (val === 'muted');
            case "smoke":
                return (val === "clear") ? Characteristic.SmokeDetected.SMOKE_NOT_DETECTED : Characteristic.SmokeDetected.SMOKE_DETECTED;
            case "carbonMonoxide":
                return (val === "clear") ? Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL : Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL;
            case "carbonDioxideMeasurement":
                switch (charName) {
                    case "Carbon Dioxide Detected":
                        return (val < 2000) ? Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL : Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL;
                    default:
                        return parseInt(val);
                }
            case "tamper":
                return (val === "detected") ? Characteristic.StatusTampered.TAMPERED : Characteristic.StatusTampered.NOT_TAMPERED;
            case "acceleration":
            case "motion":
                return (val === "active");
            case "water":
                return (val === "dry") ? Characteristic.LeakDetected.LEAK_NOT_DETECTED : Characteristic.LeakDetected.LEAK_DETECTED;
            case "contact":
                return (val === "closed") ? Characteristic.ContactSensorState.CONTACT_DETECTED : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
            case "presence":
                return (val === "present");
            case "battery":
                if (charName === "Status Low Battery") {
                    return (val < 20) ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                } else {
                    return Math.round(val);
                }
            case "batteryStatus":
                return (val === "USB Cable") ? Characteristic.ChargingState.CHARGING : Characteristic.ChargingState.NOT_CHARGING;
            case "hue":
                return Math.round(val * 3.6);
            case "colorTemperature":
                return this.colorTempFromK(val);
            case "temperature":
                return this.tempConversion(val);
            case "heatingSetpoint":
            case "coolingSetpoint":
            case "thermostatSetpoint":
                return this.thermostatTempConversion(val);
            case "fanSpeed":
                return this.fanSpeedIntToLevel(val);
            case "level":
            case "saturation":
            case "volume":
                return parseInt(val) || 0;
            case "illuminance":
                return Math.round(Math.ceil(parseFloat(val)), 0);

            case "energy":
            case "humidity":
            case "power":
                return Math.round(val);
            case "thermostatOperatingState":
                switch (val) {
                    case "pending cool":
                    case "cooling":
                        return Characteristic.CurrentHeatingCoolingState.COOL;
                    case "pending heat":
                    case "heating":
                        return Characteristic.CurrentHeatingCoolingState.HEAT;
                    default:
                        // The above list should be inclusive, but we need to return something if they change stuff.
                        // TODO: Double check if Smartthings can send "auto" as operatingstate. I don't think it can.
                        return Characteristic.CurrentHeatingCoolingState.OFF;
                }
            case "thermostatMode":
                switch (val) {
                    case "cool":
                        return Characteristic.TargetHeatingCoolingState.COOL;
                    case "emergency heat":
                    case "heat":
                        return Characteristic.TargetHeatingCoolingState.HEAT;
                    case "auto":
                        return Characteristic.TargetHeatingCoolingState.AUTO;
                    default:
                        return Characteristic.TargetHeatingCoolingState.OFF;
                }
            case "thermostatFanMode":
                if (val === Characteristic.TargetFanState.MANUAL) {
                    return 'on';
                } else {
                    return 'auto';
                }

            case "windowShade":
                if (val === 'opening') {
                    return Characteristic.PositionState.INCREASING;
                } else if (val === 'closing') {
                    return Characteristic.PositionState.DECREASING;
                } else {
                    return Characteristic.PositionState.STOPPED;
                }
            case "alarmSystemStatus":
                return this.convertAlarmState(val);
            default:
                return val;
        }
    }

    transformCommandName(attr, val) {
        switch (attr) {
            case "valve":
                return (val === 1 || val === true) ? "open" : "close";
            case "switch":
                return (val === 1 || val === true) ? "on" : "off";
            case "door":
                if (val === Characteristic.TargetDoorState.OPEN || val === 0) {
                    return "open";
                } else {
                    return "close";
                }

            case "lock":
                return (val === 1 || val === true) ? "lock" : "unlock";
            case "mute":
                return (val === "muted") ? "mute" : "unmute";
            case "fanSpeed":
            case "level":
            case "volume":
            case "thermostatMode":
            case "saturation":
            case "hue":
            case "colorTemperature":
                return `set${attr.charAt(0).toUpperCase() + attr.slice(1)}`;
            case "thermostatFanMode":
                switch (val) {
                    case Characteristic.TargetFanState.MANUAL:
                        return "fanOn";
                    default:
                        return "fanAuto";
                }
            default:
                return val;
        }
    }

    transformCommandValue(attr, val) {
        switch (attr) {
            case "valve":
                return (val === 1 || val === true) ? "open" : "close";
            case "switch":
                return (val === 1 || val === true) ? "on" : "off";
            case "lock":
                return (val === 1 || val === true) ? "lock" : "unlock";
            case "door":
                if (val === Characteristic.TargetDoorState.OPEN || val === 0) {
                    return "open";
                } else if (val === Characteristic.TargetDoorState.CLOSED || val === 1) {
                    return "close";
                }
                return 'closing';
            case "hue":
                return Math.round(val / 3.6);
            case "colorTemperature":
                return this.colorTempToK(val);
            case "mute":
                return (val === "muted") ? "mute" : "unmute";
            case "alarmSystemStatus":
                return this.convertAlarmCmd(val);
            case "fanSpeed":
                if (val === 0) {
                    return 0;
                } else if (val < 34) {
                    return 1;
                } else if (val < 67) {
                    return 2;
                } else {
                    return 3;
                }
            case "thermostatMode":
                switch (val) {
                    case Characteristic.TargetHeatingCoolingState.COOL:
                        return "cool";
                    case Characteristic.TargetHeatingCoolingState.HEAT:
                        return "heat";
                    case Characteristic.TargetHeatingCoolingState.AUTO:
                        return "auto";
                    case Characteristic.TargetHeatingCoolingState.OFF:
                        return "off";
                    default:
                        return undefined;
                }

            case "fanMode":
                if (val >= 0 && val <= CommunityTypes.FanOscilationMode.SLEEP) {
                    return "sleep";
                } else if (val > CommunityTypes.FanOscilationMode.SLEEP && val <= CommunityTypes.FanOscilationMode.LOW) {
                    return "low";
                } else if (val > CommunityTypes.FanOscilationMode.LOW && val <= CommunityTypes.FanOscilationMode.MEDIUM) {
                    return "medium";
                } else if (val > CommunityTypes.FanOscilationMode.MEDIUM && val <= CommunityTypes.FanOscilationMode.HIGH) {
                    return "high";
                } else {
                    return "sleep";
                }
            default:
                return val;
        }
    }

    colorTempFromK(temp) {
        return (1000000 / temp).toFixed();
    }

    colorTempToK(temp) {
        return (1000000 / temp).toFixed();
    }

    thermostatTempConversion(temp, isSet = false) {
        if (isSet) {
            return (this.platform.getTempUnit() === 'C') ? Math.round(temp) : Math.round(temp * 1.8 + 32);
        } else {
            return (this.platform.getTempUnit() === 'C') ? Math.round(temp * 10) / 10 : Math.round((temp - 32) / 1.8 * 10) / 10;
        }
    }

    thermostatTargetTemp(devData) {
        // console.log('ThermostatMode:', devData.attributes.thermostatMode, ' | thermostatOperatingState: ', devData.attributes.thermostatOperatingState);
        switch (devData.attributes.thermostatMode) {
            case 'cool':
            case 'cooling':
                return devData.attributes.coolingSetpoint;
            case 'emergency heat':
            case 'heat':
            case 'heating':
                return devData.attributes.heatingSetpoint;
            default:
                {
                    const cool = devData.attributes.coolingSetpoint;
                    const heat = devData.attributes.heatingSetpoint;
                    const cur = devData.attributes.temperature;
                    const cDiff = Math.abs(cool - cur);
                    const hDiff = Math.abs(heat - cur);
                    const useCool = cDiff < hDiff;
                    // console.log('(cool-cur):', cDiff);
                    // console.log('(heat-cur):', hDiff);
                    // console.log(`targerTemp(GET) | cool: ${cool} | heat: ${heat} | cur: ${cur} | useCool: ${useCool}`);
                    return useCool ? cool : heat;
                }
        }
    }

    thermostatSupportedModes(devData) {
        let hasHeatSetpoint = (devData.attributes.heatingSetpoint !== undefined || devData.attributes.heatingSetpoint !== null);
        let hasCoolSetpoint = (devData.attributes.coolingSetpoint !== undefined || devData.attributes.coolingSetpoint !== null);
        let sModes = devData.attributes.supportedThermostatModes || [];
        let validModes = [Characteristic.TargetHeatingCoolingState.OFF];
        if ((sModes.length && sModes.includes("heat")) || sModes.includes("emergency heat") || hasHeatSetpoint)
            validModes.push(Characteristic.TargetHeatingCoolingState.HEAT);

        if ((sModes.length && sModes.includes("cool")) || hasCoolSetpoint)
            validModes.push(Characteristic.TargetHeatingCoolingState.COOL);

        if ((sModes.length && sModes.includes("auto")) || (hasCoolSetpoint && hasHeatSetpoint))
            validModes.push(Characteristic.TargetHeatingCoolingState.AUTO);
        return validModes;
    }

    thermostatTargetTemp_set(devData) {
        let cmdName;
        let attrName;
        switch (devData.attributes.thermostatMode) {
            case "cool":
                cmdName = "setCoolingSetpoint";
                attrName = "coolingSetpoint";
                break;
            case "emergency heat":
            case "heat":
                cmdName = "setHeatingSetpoint";
                attrName = "heatingSetpoint";
                break;
            default:
                {
                    // This should only refer to auto
                    // Choose closest target as single target
                    const cool = devData.attributes.coolingSetpoint;
                    const heat = devData.attributes.heatingSetpoint;
                    const cur = devData.attributes.temperature;
                    const cDiff = Math.abs(cool - cur);
                    const hDiff = Math.abs(heat - cur);
                    const useCool = cDiff < hDiff;
                    // console.log('(cool-cur):', cDiff);
                    // console.log('(heat-cur):', hDiff);
                    // console.log(`targerTemp(SET) | cool: ${cool} | heat: ${heat} | cur: ${cur} | useCool: ${useCool}`);
                    cmdName = useCool ? "setCoolingSetpoint" : "setHeatingSetpoint";
                    attrName = useCool ? "coolingSetpoint" : "heatingSetpoint";
                }
        }
        return {
            cmdName: cmdName,
            attrName: attrName
        };
    }

    tempConversion(temp, onlyC = false) {
        if (this.platform.getTempUnit() === 'C' || onlyC) {
            return (parseFloat(temp * 10) / 10);
        } else {
            return (parseFloat((temp - 32) / 1.8 * 10) / 10).toFixed(2);
        }
    }

    cToF(temp) {
        return (parseFloat(temp * 10) / 10);
    }

    fToC(temp) {
        return (parseFloat((temp - 32) / 1.8 * 10) / 10);
    }

    fanSpeedConversion(speedVal, has4Spd = false) {
        if (speedVal <= 0) {
            return "off";
        }
        if (has4Spd) {
            if (speedVal > 0 && speedVal <= 25) {
                return "low";
            } else if (speedVal > 25 && speedVal <= 50) {
                return "med";
            } else if (speedVal > 50 && speedVal <= 75) {
                return "medhigh";
            } else if (speedVal > 75 && speedVal <= 100) {
                return "high";
            }
        } else {
            if (speedVal > 0 && speedVal <= 33) {
                return "low";
            } else if (speedVal > 33 && speedVal <= 66) {
                return "medium";
            } else if (speedVal > 66 && speedVal <= 99) {
                return "high";
            }
        }
    }

    fanSpeedConversionInt(speedVal) {
        if (!speedVal || speedVal <= 0) {
            return "off";
        } else if (speedVal === 1) {
            return "low";
        } else if (speedVal === 2) {
            return "medium";
        } else if (speedVal === 3) {
            return "high";
        }
    }

    fanSpeedIntToLevel(speedVal) {
        switch (speedVal) {
            case 0:
                return 0;
            case 1:
                return 32;
            case 2:
                return 66;
            case 3:
                return 100;
            default:
                return 0;
        }
    }

    fanSpeedLevelToInt(val) {
        if (val > 0 && val < 33) {
            return 1;
        } else if (val >= 33 && val < 66) {
            return 2;
        } else if (val >= 66 && val <= 100) {
            return 3;
        } else {
            return 0;
        }
    }

    convertAlarmState(value) {
        switch (value) {
            case "stay":
            case "night":
                return Characteristic.SecuritySystemCurrentState.STAY_ARM;
            case "away":
                return Characteristic.SecuritySystemCurrentState.AWAY_ARM;
            case "off":
                return Characteristic.SecuritySystemCurrentState.DISARMED;
            case "alarm_active":
                return Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED;
        }
    }

    convertAlarmCmd(value) {
        switch (value) {
            case 0:
            case 2:
                return "stay";
            case 1:
                return "away";
            case 3:
                return "off";
            case 4:
                return "alarm_active";
        }
    }
};