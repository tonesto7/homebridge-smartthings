const {
    pluginName,
    platformName
} = require("./libs/Constants"),
    StPlatform = require("./ST_Platform");

module.exports = (homebridge) => {
    homebridge.registerPlatform(pluginName, platformName, StPlatform, true);
};