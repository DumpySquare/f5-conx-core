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

export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}


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
export default class Logger {
    journal = [];

    /**
     * buffer log messages
     * 
     * @default false
     */
    buffer = false;
    /**
     * output log messages to console
     * @default true
     */
    console = true;
    private static instance: Logger;

    /**
     * Get logger instance (singleton)
     * 
     * @param options.buffer enable/disable buffering
     * @param options.console enable/disable output to console.log
     * @returns logger instance
     */
    static getLogger(
        // options?: { 
        // buffer?: string, 
        // console?: string 
    // }
    ): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }

        // assign switches
        // Logger.instance.buffer = options?.buffer;
        // Logger.instance.console = options?.console;

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
        
        // make timestamp
        const dateTime = new Date().toISOString();
        
        // put everything together
        const log = `[${dateTime}] [${level}]: ${message}`
        
        if (this.buffer) {
            // todo: put some sort of limit on the buffer size (max 500?)
            this.journal.push(log);
        }
        
        if (this.console) {
            console.log(log);
        }

    }

    getLogs(): string[] {
        return this.journal;
    }


    private _checkLogLevel(): string {
        const logLevels = Object.keys(LOG_LEVELS);
        const logLevelFromEnvVar = process.env[constants.ENV_VARS.LOG_LEVEL];

        
        if(process.env.F5_CONX_CORE_LOG_BUFFER){
            this.buffer = (process.env?.F5_CONX_CORE_LOG_BUFFER == 'true');
        }

        if (process.env.F5_CONX_CORE_LOG_CONSOLE) {
            this.console = (process.env.F5_CONX_CORE_LOG_CONSOLE == 'true');
        }

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