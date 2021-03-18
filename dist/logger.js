/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
const util_1 = require("util");
const LOG_LEVELS = {
    error: 3,
    warning: 4,
    info: 6,
    debug: 7
};
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
// levels have been updated to allign better with typical syslog
// https://support.solarwinds.com/SuccessCenter/s/article/Syslog-Severity-levels?language=en_US
/**
 *
 * Basic Example:
 *
 * ```bash
 * export F5_CONX_CORE_LOG_LEVEL='DEBUG'
 * ```
 */
class Logger {
    constructor() {
        this.journal = [];
        /**
         * buffer log messages
         * @default true
         */
        this.buffer = true;
        /**
         * output log messages to console
         * @default true
         */
        this.console = true;
        /**
         * overwritable function to allow additional output integrations
         * @param x log message
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.output = function (x) {
            // by default, do nothing...
            // to be overwritten by user/app
            // I guess we could have just emitted an event...
            // but, this function method could be modified to allow formatting changes
        };
    }
    /**
     * Get logger instance (singleton)
     *
     * @param options.buffer enable/disable buffering
     * @param options.console enable/disable output to console.log
     * @returns logger instance
     */
    static getLogger() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * clear/delete buffer/journal
     */
    clearLogs() {
        return this.journal.length = 0;
    }
    /**
     * Log debug message
     */
    debug(...msg) {
        const x = LOG_LEVELS.debug;
        const y = LOG_LEVELS[this._checkLogLevel()];
        if (x <= y) {
            this.log('DEBUG', ...msg);
        }
    }
    /**
     * Log informational message
     */
    info(...msg) {
        if (LOG_LEVELS.info <= LOG_LEVELS[this._checkLogLevel()]) {
            this.log('INFO', ...msg);
        }
    }
    /**
     * Log warning message
     */
    warning(...msg) {
        if (LOG_LEVELS.warning <= LOG_LEVELS[this._checkLogLevel()]) {
            this.log('WARNING', ...msg);
        }
    }
    /**
     * Log error message
     */
    error(...msg) {
        // all error messages get logged...
        this.log('ERROR', ...msg);
    }
    /** base log function
     *
     */
    log(level, ...messageParts) {
        // join all the log message parts
        const message = messageParts.map(this.stringify).join(' ');
        // make timestamp
        const dateTime = new Date().toISOString();
        // put everything together
        const log = `[${dateTime}] [${level}]: ${message}`;
        // pass log to external output function option
        this.output(log);
        if (this.buffer) {
            // todo: put some sort of limit on the buffer size (max 500?)
            this.journal.push(log);
        }
        if (this.console) {
            console.log(log);
        }
    }
    _checkLogLevel() {
        const logLevels = Object.keys(LOG_LEVELS);
        const logLevelFromEnvVar = process.env.F5_CONX_CORE_LOG_LEVEL;
        if (process.env.F5_CONX_CORE_LOG_BUFFER) {
            this.buffer = (process.env.F5_CONX_CORE_LOG_BUFFER == 'true');
        }
        if (process.env.F5_CONX_CORE_LOG_CONSOLE) {
            this.console = (process.env.F5_CONX_CORE_LOG_CONSOLE == 'true');
        }
        if (logLevelFromEnvVar && logLevels.includes(logLevelFromEnvVar.toLowerCase())) {
            return logLevelFromEnvVar.toLowerCase();
        }
        return 'info';
    }
    stringify(val) {
        if (typeof val === 'string') {
            return val;
        }
        return util_1.inspect(val, {
            colors: false,
            depth: 6,
        });
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map