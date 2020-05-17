const knownCapabilities = require("./libs/Constants").knownCapabilities,
    pluginVersion = require("./libs/Constants").pluginVersion,
    _ = require("lodash"),
    ServiceTypes = require("./ST_ServiceTypes"),
    Transforms = require("./ST_Transforms"),
    DeviceTypes = require("./ST_DeviceCharacteristics");
var Service, Characteristic, appEvts;

module.exports = class ST_Accessories {
    constructor(platform) {
        this.mainPlatform = platform;
        appEvts = platform.appEvts;
        this.logConfig = platform.logConfig;
        this.configItems = platform.getConfigItems();
        this.myUtils = platform.myUtils;
        this.log = platform.log;
        this.hap = platform.hap;
        this.uuid = platform.uuid;
        Service = platform.Service;
        Characteristic = platform.Characteristic;
        this.CommunityTypes = require("./libs/CommunityTypes")(Service, Characteristic);
        this.client = platform.client;
        this.comparator = this.comparator.bind(this);
        this.transforms = new Transforms(this, Characteristic);
        this.serviceTypes = new ServiceTypes(this, Service);
        this.device_types = new DeviceTypes(this, Characteristic);
        this._accessories = {};
        this._buttonMap = {};
        this._attributeLookup = {};
    }

    initializeAccessory(accessory, fromCache = false) {
        if (!fromCache) {
            accessory.deviceid = accessory.context.deviceData.deviceid;
            accessory.name = accessory.context.deviceData.name;
            accessory.context.deviceData.excludedCapabilities.forEach((cap) => {
                if (cap !== undefined) {
                    this.log.debug(`Removing capability: ${cap} from Device: ${accessory.context.deviceData.name}`);
                    delete accessory.context.deviceData.capabilities[cap];
                }
            });
            accessory.context.name = accessory.context.deviceData.name;
            accessory.context.deviceid = accessory.context.deviceData.deviceid;
        } else {
            this.log.debug(`Initializing Cached Device ${accessory.context.deviceid}`);
            accessory.deviceid = accessory.context.deviceid;
            accessory.name = accessory.context.name;
        }
        try {
            accessory.commandTimers = {};
            accessory.commandTimersTS = {};
            accessory.context.uuid = accessory.UUID || this.uuid.generate(`smartthings_v2_${accessory.deviceid}`);
            accessory.getOrAddService = this.getOrAddService.bind(accessory);
            accessory.getOrAddServiceByName = this.getOrAddServiceByName.bind(accessory);
            accessory.getOrAddCharacteristic = this.getOrAddCharacteristic.bind(accessory);
            accessory.hasCapability = this.hasCapability.bind(accessory);
            accessory.getCapabilities = this.getCapabilities.bind(accessory);
            accessory.hasAttribute = this.hasAttribute.bind(accessory);
            accessory.hasCommand = this.hasCommand.bind(accessory);
            accessory.hasDeviceFlag = this.hasDeviceFlag.bind(accessory);
            accessory.hasService = this.hasService.bind(accessory);
            accessory.hasCharacteristic = this.hasCharacteristic.bind(accessory);
            accessory.updateDeviceAttr = this.updateDeviceAttr.bind(accessory);
            accessory.updateCharacteristicVal = this.updateCharacteristicVal.bind(accessory);
            accessory.manageGetCharacteristic = this.device_types.manageGetCharacteristic.bind(accessory);
            accessory.manageGetSetCharacteristic = this.device_types.manageGetSetCharacteristic.bind(accessory);
            accessory.sendCommand = this.sendCommand.bind(accessory);
            return this.configureCharacteristics(accessory);
        } catch (err) {
            this.log.error(`initializeAccessory (fromCache: ${fromCache}) Error:`, err);
            // console.error(err);
            return accessory;
        }
    }

    configureCharacteristics(accessory) {
        for (let index in accessory.context.deviceData.capabilities) {
            if (knownCapabilities.indexOf(index) === -1 && this.mainPlatform.unknownCapabilities.indexOf(index) === -1) this.mainPlatform.unknownCapabilities.push(index);
        }
        accessory.context.deviceGroups = [];
        accessory.servicesToKeep = [];
        accessory.reachable = true;
        accessory.context.lastUpdate = new Date();

        let accessoryInformation = accessory
            .getOrAddService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.FirmwareRevision, accessory.context.deviceData.firmwareVersion)
            .setCharacteristic(Characteristic.Manufacturer, accessory.context.deviceData.manufacturerName)
            .setCharacteristic(Characteristic.Model, accessory.context.deviceData.modelName ? `${this.myUtils.toTitleCase(accessory.context.deviceData.modelName)}` : "Unknown")
            .setCharacteristic(Characteristic.Name, accessory.context.deviceData.name)
            .setCharacteristic(Characteristic.HardwareRevision, pluginVersion);
        accessory.servicesToKeep.push(Service.AccessoryInformation.UUID);

        if (!accessoryInformation.listeners("identify")) {
            accessoryInformation.on("identify", function(paired, callback) {
                this.log.info("%s - identify", accessory.displayName);
                callback();
            });
        }

        let svcTypes = this.serviceTypes.getServiceTypes(accessory);
        if (svcTypes) {
            svcTypes.forEach((svc) => {
                if (svc.name && svc.type) {
                    this.log.debug(accessory.name, " | ", svc.name);
                    accessory.servicesToKeep.push(svc.type.UUID);
                    this.device_types[svc.name](accessory, svc.type);
                }
            });
        } else {
            throw "Unable to determine the service type of " + accessory.deviceid;
        }
        return this.removeUnusedServices(accessory);
    }

    processDeviceAttributeUpdate(change) {
        // let that = this;
        return new Promise((resolve) => {
            let characteristics = this.getAttributeStoreItem(change.attribute, change.deviceid);
            let accessory = this.getAccessoryFromCache(change);
            // console.log(characteristics);
            if (!characteristics || !accessory) resolve(false);
            if (characteristics instanceof Array) {
                characteristics.forEach((char) => {
                    accessory.context.deviceData.attributes[change.attribute] = change.value;
                    accessory.context.lastUpdate = new Date().toLocaleString();
                    switch (change.attribute) {
                        case "thermostatSetpoint":
                            char.getValue();
                            break;
                        case "button":
                            // console.log(characteristics);
                            var btnNum = change.data && change.data.buttonNumber ? change.data.buttonNumber : 1;
                            if (btnNum && accessory.buttonEvent !== undefined) {
                                accessory.buttonEvent(btnNum, change.value, change.deviceid, this._buttonMap);
                            }
                            break;
                        default:
                            char.updateValue(this.transforms.transformAttributeState(change.attribute, change.value, char.displayName));
                            break;
                    }
                });
                resolve(this.addAccessoryToCache(accessory));
            } else {
                resolve(false);
            }
        });
    }

    sendCommand(callback, acc, dev, cmd, vals) {
        const id = `${cmd}`;
        const tsNow = Date.now();
        let d = 0;
        let b = false;
        let d2;
        let o = {};
        switch (cmd) {
            case "setLevel":
            case "setVolume":
            case "setFanSpeed":
            case "setSaturation":
            case "setHue":
            case "setColorTemperature":
            case "setHeatingSetpoint":
            case "setCoolingSetpoint":
            case "setThermostatSetpoint":
                d = 600;
                d2 = 1500;
                o.trailing = true;
                break;
            case "setThermostatMode":
                d = 600;
                d2 = 1500;
                o.trailing = true;
                break;
            default:
                b = true;
                break;
        }

        if (b) {
            appEvts.emit("event:device_command", dev, cmd, vals);
        } else {
            let lastTS = acc.commandTimersTS[id] && tsNow ? tsNow - acc.commandTimersTS[id] : undefined;
            // console.log("lastTS: " + lastTS, ' | ts:', acc.commandTimersTS[id]);
            if (acc.commandTimers[id] && acc.commandTimers[id] !== null) {
                acc.commandTimers[id].cancel();
                acc.commandTimers[id] = null;
                // console.log('lastTS: ', lastTS, ' | now:', tsNow, ' | last: ', acc.commandTimersTS[id]);
                // console.log(`Existing Command Found | Command: ${cmd} | Vals: ${vals} | Executing in (${d}ms) | Last Cmd: (${lastTS ? (lastTS/1000).toFixed(1) : "unknown"}sec) | Id: ${id} `);
                if (lastTS && lastTS < d) {
                    d = d2 || 0;
                }
            }
            acc.commandTimers[id] = _.debounce(
                async() => {
                    acc.commandTimersTS[id] = tsNow;
                    appEvts.emit("event:device_command", dev, cmd, vals);
                },
                d,
                o,
            );
            acc.commandTimers[id]();
        }
        if (callback) {
            callback();
            callback = undefined;
        }
    }

    log_change(attr, char, acc, chgObj) {
        if (this.logConfig.debug === true) this.log.notice(`[CHARACTERISTIC (${char}) CHANGE] ${attr} (${acc.displayName}) | LastUpdate: (${acc.context.lastUpdate}) | NewValue: (${chgObj.newValue}) | OldValue: (${chgObj.oldValue})`);
    }

    log_get(attr, char, acc, val) {
        if (this.logConfig.debug === true) this.log.good(`[CHARACTERISTIC (${char}) GET] ${attr} (${acc.displayName}) | LastUpdate: (${acc.context.lastUpdate}) | Value: (${val})`);
    }

    log_set(attr, char, acc, val) {
        if (this.logConfig.debug === true) this.log.warn(`[CHARACTERISTIC (${char}) SET] ${attr} (${acc.displayName}) | LastUpdate: (${acc.context.lastUpdate}) | Value: (${val})`);
    }

    hasCapability(obj) {
        let keys = Object.keys(this.context.deviceData.capabilities);
        if (keys.includes(obj) || keys.includes(obj.toString().replace(/\s/g, ""))) return true;
        return false;
    }

    getCapabilities() {
        return Object.keys(this.context.deviceData.capabilities);
    }

    hasAttribute(attr) {
        return Object.keys(this.context.deviceData.attributes).includes(attr) || false;
    }

    hasCommand(cmd) {
        return Object.keys(this.context.deviceData.commands).includes(cmd) || false;
    }

    getCommands() {
        return Object.keys(this.context.deviceData.commands);
    }

    hasService(service) {
        return this.services.map((s) => s.UUID).includes(service.UUID) || false;
    }

    hasCharacteristic(svc, char) {
        let s = this.getService(svc) || undefined;
        return (s && s.getCharacteristic(char) !== undefined) || false;
    }

    updateCharacteristicVal(svc, char, val) {
        this.getOrAddService(svc).setCharacteristic(char, val);
    }

    updateCharacteristicProps(svc, char, props) {
        this.getOrAddService(svc).getCharacteristic(char).setProps(props);
    }

    hasDeviceFlag(flag) {
        return (this.context && this.context.deviceData && this.context.deviceData.deviceflags && Object.keys(this.context.deviceData.deviceflags).includes(flag)) || false;
    }

    updateDeviceAttr(attr, val) {
        this.context.deviceData.attributes[attr] = val;
    }

    getOrAddService(svc) {
        return this.getService(svc) || this.addService(svc);
    }

    getOrAddServiceByName(service, dName, sType) {
        let svc = this.services.find((s) => s.displayName === dName);
        if (svc) {
            // console.log('service found');
            return svc;
        } else {
            // console.log('service not found adding new one...');
            svc = this.addService(new service(dName, sType));
            return svc;
        }
    }

    getOrAddCharacteristic(service, characteristic) {
        return service.getCharacteristic(characteristic) || service.addCharacteristic(characteristic);
    }

    getServices() {
        return this.services;
    }

    removeUnusedServices(acc) {
        // console.log('servicesToKeep:', acc.servicesToKeep);
        let newSvcUuids = acc.servicesToKeep || [];
        let svcs2rmv = acc.services.filter((s) => !newSvcUuids.includes(s.UUID));
        if (Object.keys(svcs2rmv).length) {
            svcs2rmv.forEach((s) => {
                acc.removeService(s);
                this.log.info("Removing Unused Service:", s.UUID);
            });
        }
        return acc;
    }

    storeCharacteristicItem(attr, devid, char) {
        // console.log('storeCharacteristicItem: ', attr, devid, char);
        if (!this._attributeLookup[attr]) {
            this._attributeLookup[attr] = {};
        }
        if (!this._attributeLookup[attr][devid]) {
            this._attributeLookup[attr][devid] = [];
        }
        this._attributeLookup[attr][devid].push(char);
    }

    getAttributeStoreItem(attr, devid) {
        if (!this._attributeLookup[attr] || !this._attributeLookup[attr][devid]) {
            return undefined;
        }
        return this._attributeLookup[attr][devid] || undefined;
    }

    removeAttributeStoreItem(attr, devid) {
        if (!this._attributeLookup[attr] || !this._attributeLookup[attr][devid]) return;
        delete this._attributeLookup[attr][devid];
    }

    getDeviceAttributeValueFromCache(device, attr) {
        const key = this.getAccessoryId(device);
        let result = this._accessories[key] ? this._accessories[key].context.deviceData.attributes[attr] : undefined;
        this.log.info(`Attribute (${attr}) Value From Cache: [${result}]`);
        return result;
    }

    getAccessoryId(accessory) {
        const id = accessory.deviceid || accessory.context.deviceid || undefined;
        return id;
    }

    getAccessoryFromCache(device) {
        const key = this.getAccessoryId(device);
        return this._accessories[key];
    }

    getAllAccessoriesFromCache() {
        return this._accessories;
    }

    clearAccessoryCache() {
        this.log.alert("CLEARING ACCESSORY CACHE AND FORCING DEVICE RELOAD");
        this._accessories = {};
    }

    addAccessoryToCache(accessory) {
        const key = this.getAccessoryId(accessory);
        this._accessories[key] = accessory;
        return true;
    }

    removeAccessoryFromCache(accessory) {
        const key = this.getAccessoryId(accessory);
        const _accessory = this._accessories[key];
        delete this._accessories[key];
        return _accessory;
    }

    forEach(fn) {
        return _.forEach(this._accessories, fn);
    }

    intersection(devices) {
        const accessories = _.values(this._accessories);
        return _.intersectionWith(devices, accessories, this.comparator);
    }

    diffAdd(devices) {
        const accessories = _.values(this._accessories);
        return _.differenceWith(devices, accessories, this.comparator);
    }

    diffRemove(devices) {
        const accessories = _.values(this._accessories);
        return _.differenceWith(accessories, devices, this.comparator);
    }

    comparator(accessory1, accessory2) {
        return this.getAccessoryId(accessory1) === this.getAccessoryId(accessory2);
    }

    clearAndSetTimeout(timeoutReference, fn, timeoutMs) {
        if (timeoutReference) clearTimeout(timeoutReference);
        return setTimeout(fn, timeoutMs);
    }
};