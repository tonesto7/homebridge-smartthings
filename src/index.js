const { pluginName, platformName } = require("./libs/Constants"),
    hePlatform = require("./HE_Platform");

module.exports = (homebridge) => {
    homebridge.registerPlatform(pluginName, platformName, hePlatform, true);
};