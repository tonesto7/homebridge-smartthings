const pluginName = require("./Constants").pluginName,
    chalk = require('chalk'),
    { createLogger, format, transports } = require('winston'),
    { combine } = format,
    util = require('util'),
    DailyRotateFile = require('winston-daily-rotate-file');

// rotateFile = require('winston-daily-rotate-file');
var DEBUG_ENABLED = false;
var TIMESTAMP_ENABLED = true;
var logger;
// var tailWindowsUrl = 'https://download.microsoft.com/download/8/e/c/8ec3a7d8-05b4-440a-a71e-ca3ee25fe057/rktools.exe';

module.exports = class Logging {
    constructor(platform, prefix, config) {
        this.platform = platform;
        this.logConfig = config;
        this.homebridge = platform.homebridge;
        this.logLevel = 'good';
        let pre = prefix;
        if (this.logConfig) {
            if (this.logConfig.debug === true) {
                this.logLevel = 'debug';
                DEBUG_ENABLED = (this.logConfig.debug === true);
            }
            TIMESTAMP_ENABLED = (this.logConfig.hideTimestamp === false);
            pre = (this.logConfig.hideNamePrefix === true) ? '' : pre;
        }
        this.options = {
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                notice: 3,
                alert: 4,
                good: 5,
                debug: 6
            }
        };
        this.prefix = pre;
    }

    getLogger() {
        let that = this;
        let trans = [
            new transports.Console({
                level: this.logLevel,
                colorize: true,
                handleExceptions: true,
                format: combine(
                    format.timestamp({ format: 'M/D/YYYY, h:mm:ss a' }),
                    format.printf((info) => {
                        const timestamp = (TIMESTAMP_ENABLED === true) ? chalk.white("[" + info.timestamp.trim() + "] ") : '';
                        const prefix = that.prefix ? chalk.cyan("[" + that.prefix + "] ") : '';
                        const strArgs = (info[Symbol.for('splat')] || []).map((arg) => {
                            return util.inspect(arg, { colors: true });
                        }).join(' ');
                        const message = (`${this.colorMsgLevel(info.level, info.message + ' ' + strArgs)}`).trim();
                        return `${timestamp}${prefix}${this.levelColor(info.level.toUpperCase())}: ${message}`;
                    })
                )
            })
        ];
        if (this.logConfig && this.logConfig.file && this.logConfig.file.enabled) {
            trans.push(new DailyRotateFile({
                filename: `${this.homebridge.user.storagePath()}/${pluginName}-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                createSymlink: true,
                symlinkName: `${pluginName}.log`,
                level: this.logConfig.file.level || this.logLevel,
                auditFile: `${this.homebridge.user.storagePath()}/${pluginName}-logaudit.json`,
                colorize: false,
                handleExceptions: true,
                zippedArchive: (this.logConfig.file.compress !== false),
                maxFiles: this.logConfig.file.daysToKeep || 5,
                maxSize: this.logConfig.file.maxFilesize || '10m',
                format: combine(
                    format.timestamp({ format: 'M/D/YYYY, h:mm:ss a' }),
                    format.printf((info) => {
                        const strArgs = (info[Symbol.for('splat')] || []).map((arg) => {
                            return util.inspect(arg, { colors: true });
                        }).join(' ');
                        return `[${info.timestamp.trim()}] [${info.level.toUpperCase()}]: ${this.removeAnsi(info.message + ' ' + strArgs)}`;
                    })
                )
            }));
        }
        logger = createLogger({
            levels: this.options.levels,
            colors: this.options.colors,
            transports: trans,
            exitOnError: false
        });
        return logger;
    }

    removeAnsi(msg) {
        // eslint-disable-next-line no-control-regex
        return msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    }

    getLogLevel(lvl) {
        return this.options.level[lvl] || 5;
    }

    levelColor(lvl) {
        switch (lvl) {
            case 'DEBUG':
                if (DEBUG_ENABLED)
                    return chalk.bold.gray(lvl);
                break;
            case 'WARN':
                return chalk.bold.keyword('orange')(lvl);
            case 'ERROR':
                return chalk.bold.red(lvl);
            case 'GOOD':
                return chalk.bold.green(lvl);
            case 'INFO':
                return chalk.bold.whiteBright(lvl);
            case 'ALERT':
                return chalk.bold.yellow(lvl);
            case 'NOTICE':
                return chalk.bold.blueBright(lvl);
            case 'CUSTOM':
                return '';
            default:
                return lvl;
        }
    }

    colorMsgLevel(lvl, msg) {
        if (msg.startsWith('chalk')) return msg;
        switch (lvl) {
            case 'debug':
                if (DEBUG_ENABLED)
                    return chalk.gray(msg);
                break;
            case 'warn':
                return chalk.keyword('orange').bold(msg);
            case 'error':
                return chalk.bold.red(msg);
            case 'good':
                return chalk.green(msg);
            case 'info':
                return chalk.white(msg);
            case 'alert':
                return chalk.yellow(msg);
            case 'notice':
                return chalk.blueBright(msg);
            case 'custom':
                return chalk `${msg}`;
            default:
                return msg;
        }
    }

    enabledDebug() {
        DEBUG_ENABLED = true;
    }

    disableDebug() {
        DEBUG_ENABLED = false;
    }

    enabledTimestamp() {
        TIMESTAMP_ENABLED = true;
    }

    disableTimestamp() {
        TIMESTAMP_ENABLED = false;
    }
};