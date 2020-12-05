/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { inspect } from 'util';

import * as constants from './constants';

const LOG_LEVELS = {
    error: 3,
    warning: 4,
    info: 6,
    debug: 7
};

/**
 * logLevel definitions
 */
export type logLevels = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'


// levels have been updated to allign better with typical syslog
// https://support.solarwinds.com/SuccessCenter/s/article/Syslog-Severity-levels?language=en_US

/**
 *
 * Basic Example:
 * 
 * ```bash
 * export F5_SDK_LOG_LEVEL='DEBUG'
 * ```
 */
export default class Logger {
    private static instance: Logger;

    /**
     * Get logger instance (singleton)
     * 
     * @returns logger instance
     */
    static getLogger(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Log debug message
     */
    debug(...msg: [unknown, ...unknown[]]): void {
        if (LOG_LEVELS.debug <= LOG_LEVELS[this._checkLogLevel()]) {
            this.log('DEBUG', ...msg);
        }
    }
    // debug(msg: string): void {
    //     if (LOG_LEVELS.debug <= LOG_LEVELS[this._checkLogLevel()]) {
    //         this._log(msg, 'DEBUG');
    //     }
    // }
    
    /**
     * Log informational message
     */
    info(...msg: [unknown, ...unknown[]]): void {
        if (LOG_LEVELS.info >= LOG_LEVELS[this._checkLogLevel()]) {
            this.log('INFO', ...msg);
            // this.log(msg, 'INFO');
        }
    }

    /**
     * Log warning message
     */
    warning(...msg: [unknown, ...unknown[]]): void {
        if (LOG_LEVELS.warning <= LOG_LEVELS[this._checkLogLevel()]) {
            // this.log(msg, 'WARNING');
            this.log('WARNING', ...msg);
        }
    }


    /**
     * Log error message
     */
    error(...msg: [unknown, ...unknown[]]): void {
        if (LOG_LEVELS.error <= LOG_LEVELS[this._checkLogLevel()]) {
            // this.log(msg, 'ERROR');
            this.log('ERROR', ...msg);
        }
    }


    /** base log function
     * 
     */
    log(level: logLevels, ...messageParts: unknown[]): void {
        
        // join all the log message parts
        const message = messageParts.map(this.stringify).join(' ');
        
        // make a date
        const dateTime = new Date().toISOString();
        
        // put everything together
        console.log(`[${dateTime}] ${level}: ${message}`);

        // todo: setup options to have the logger output to console, and/or hold the logs in a buffer
        
    }


    private _checkLogLevel(): string {
        const logLevels = Object.keys(LOG_LEVELS);
        const logLevelFromEnvVar = process.env[constants.ENV_VARS.LOG_LEVEL];

        if (logLevelFromEnvVar && logLevels.includes(logLevelFromEnvVar.toLowerCase())) {
            return logLevelFromEnvVar.toLowerCase();
        }
        return 'info';
    }

    private stringify(val: unknown): string {
        if (typeof val === 'string') { return val; }
        return inspect(val, {
            colors: false,
            depth: 6, // heuristic
        });
    }


}