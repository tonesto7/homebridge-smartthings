// const debounce = require('debounce-promise');
var Service;

module.exports = class ServiceTypes {
    constructor(accessories, srvc) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        Service = srvc;
        this.homebridge = accessories.homebridge;
        this.serviceMap = {
            acceleration_sensor: Service.MotionSensor,
            air_purifier: this.CommunityTypes.NewAirPurifierService,
            air_quality: Service.AirQualitySensor,
            alarm_system: Service.SecuritySystem,
            battery: Service.BatteryService,
            button: Service.StatelessProgrammableSwitch,
            carbon_dioxide: Service.CarbonDioxideSensor,
            carbon_monoxide: Service.CarbonMonoxideSensor,
            contact_sensor: Service.ContactSensor,
            // energy_meter: Service.Switch,
            fan: Service.Fanv2,
            garage_door: Service.GarageDoorOpener,
            humidity_sensor: Service.HumiditySensor,
            illuminance_sensor: Service.LightSensor,
            light: Service.Lightbulb,
            lock: Service.LockMechanism,
            motion_sensor: Service.MotionSensor,
            // power_meter: Service.Switch,
            presence_sensor: Service.OccupancySensor,
            smoke_detector: Service.SmokeSensor,
            speaker: Service.Speaker,
            switch_device: Service.Switch,
            temperature_sensor: Service.TemperatureSensor,
            thermostat: Service.Thermostat,
            valve: Service.Valve,
            virtual_mode: Service.Switch,
            virtual_routine: Service.Switch,
            water_sensor: Service.LeakSensor,
            window_shade: Service.WindowCovering
        };
    }

    getServiceTypes(accessory) {
        let servicesFound = [];
        let servicesBlocked = [];
        for (let i = 0; i < serviceTests.length; i++) {
            const svcTest = serviceTests[i];
            if (svcTest.ImplementsService(accessory)) {
                // console.log(svcTest.Name);
                const blockSvc = (svcTest.onlyOnNoGrps === true && servicesFound.length > 0);
                if (blockSvc) {
                    servicesBlocked.push(svcTest.Name);
                    this.log.debug(`(${accessory.name}) | Service BLOCKED | name: ${svcTest.Name} | Cnt: ${servicesFound.length} | svcs: ${JSON.stringify(servicesFound)}`);
                }
                if (!blockSvc && this.serviceMap[svcTest.Name]) {
                    servicesFound.push({
                        name: svcTest.Name,
                        type: this.serviceMap[svcTest.Name]
                    });
                }
            }
        }
        if (servicesBlocked.length) {
            this.log.debug(`(${accessory.name}) | Services BLOCKED | ${servicesBlocked}`);
        }
        return servicesFound;
    }

    lookupServiceType(name) {
        if (this.serviceMap[name]) {
            return this.serviceMap[name];
        }
        return null;
    }
};

class ServiceTest {
    constructor(name, testfn, onlyOnNoGrps = false) {
        this.ImplementsService = testfn;
        this.Name = name;
        this.onlyOnNoGrps = (onlyOnNoGrps !== false);
    }
}

//TODO: Build out the access into capabilitiy map { hasSwitch: true, hasWater: false, hasPower: false }
//TODO: Use those to help filter out the ServiceTest items below instead of a long line of accessory.hasCapability and hasAttribute.
//TODO: or break each comparision item into a promise.all type logic.

// NOTE: These Tests are executed in order which is important
const serviceTests = [
    new ServiceTest("window_shade", accessory => (
        (
            accessory.hasCapability('Window Shade') ||
            accessory.hasCapability('WindowShade')
        ) &&
        !(
            accessory.hasCapability('Speaker') ||
            accessory.hasCapability('Fan') ||
            accessory.hasCapability('Fan Light') ||
            accessory.hasCapability('Fan Speed') ||
            accessory.hasCapability('Fan Control') ||
            accessory.hasCommand('setFanSpeed') ||
            accessory.hasCommand('lowSpeed') ||
            accessory.hasAttribute('fanSpeed') ||
            accessory.hasCapability('custom.airPurifierOperationMode')
        )
    ), true),
    new ServiceTest("light", accessory => (accessory.hasCapability('Switch Level') && (accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.includes('light') || accessory.hasAttribute('saturation') || accessory.hasAttribute('hue') || accessory.hasAttribute('colorTemperature') || accessory.hasCapability("Color Control"))), true),
    new ServiceTest("air_purifier", accessory => accessory.hasCapability('custom.airPurifierOperationMode')),
    new ServiceTest("garage_door", accessory => accessory.hasCapability("Garage Door Control")),
    new ServiceTest("lock", accessory => accessory.hasCapability("Lock")),
    new ServiceTest("valve", accessory => accessory.hasCapability("Valve")),
    new ServiceTest("speaker", accessory => accessory.hasCapability('Speaker')),
    new ServiceTest("fan", accessory => ((accessory.hasCapability('Fan') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Fan Speed') || accessory.hasCapability('Fan Control') || accessory.hasCommand('setFanSpeed') || accessory.hasCommand('lowSpeed') || accessory.hasAttribute('fanSpeed'))), true),
    new ServiceTest("virtual_mode", accessory => accessory.hasCapability("Mode")),
    new ServiceTest("virtual_routine", accessory => accessory.hasCapability("Routine")),
    new ServiceTest("button", accessory => accessory.hasCapability("Button")),
    new ServiceTest("light", accessory => (accessory.hasCapability('Switch') && (accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.toLowerCase().includes('light'))), true),
    new ServiceTest("switch_device", accessory => (accessory.hasCapability('Switch') && !(accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.toLowerCase().includes('light') || accessory.hasCapability('Button'))), true),
    new ServiceTest("smoke_detector", accessory => accessory.hasCapability("Smoke Detector") && accessory.hasAttribute('smoke')),
    new ServiceTest("carbon_monoxide", accessory => accessory.hasCapability("Carbon Monoxide Detector") && accessory.hasAttribute('carbonMonoxide')),
    new ServiceTest("carbon_dioxide", accessory => accessory.hasCapability("Carbon Dioxide Measurement") && accessory.hasAttribute('carbonDioxideMeasurement')),
    new ServiceTest("motion_sensor", accessory => (accessory.hasCapability("Motion Sensor"))),
    new ServiceTest("acceleration_sensor", accessory => (accessory.hasCapability("Acceleration Sensor"))),
    new ServiceTest("water_sensor", accessory => (accessory.hasCapability("Water Sensor"))),
    new ServiceTest("presence_sensor", accessory => (accessory.hasCapability("Presence Sensor"))),
    new ServiceTest("humidity_sensor", accessory => (accessory.hasCapability("Relative Humidity Measurement") && !(accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState')))),
    new ServiceTest("temperature_sensor", accessory => (accessory.hasCapability("Temperature Measurement") && !(accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState')))),
    new ServiceTest("illuminance_sensor", accessory => (accessory.hasCapability("Illuminance Measurement"))),
    new ServiceTest("contact_sensor", accessory => (accessory.hasCapability('Contact Sensor') && !accessory.hasCapability('Garage Door Control'))),
    new ServiceTest("air_quality", accessory => (accessory.hasCapability('airQuality'))),
    new ServiceTest("battery", accessory => (accessory.hasCapability('Battery'))),
    // new ServiceTest("energy_meter", accessory => (accessory.hasCapability('Energy Meter') && !accessory.hasCapability('Switch')), true),
    // new ServiceTest("power_meter", accessory => (accessory.hasCapability('Power Meter') && !accessory.hasCapability('Switch')), true),
    new ServiceTest("thermostat", accessory => (accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState'))),
    new ServiceTest("alarm_system", accessory => (accessory.hasAttribute("alarmSystemStatus")))
];