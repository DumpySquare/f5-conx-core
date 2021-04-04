/**
 * logLevel definitions
 */
export declare type logLevels = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
/**
 *
 * Basic Example:
 *
 * ```bash
 * export F5_CONX_CORE_LOG_LEVEL='DEBUG'
 * ```
 */
export default class Logger {
    /**
     * journal array of log messages
     */
    readonly journal: any[];
    /**
     * log level
     */
    logLevel: logLevels;
    /**
     * buffer log messages in the journal
     * @default true
     */
    buffer: boolean;
    /**
     * output log messages to console
     * @default true
     */
    console: boolean;
    private static instance;
    constructor();
    /**
     * Get logger instance (singleton)
     *
     * @returns logger instance
     */
    static getLogger(): Logger;
    /**
     * clear/delete buffer/journal
     */
    clearLogs(): number;
    /**
     * overwritable function to allow additional output integrations
     * @param x log message
     */
    output: (x: string) => void;
    /**
     * Log debug message
     */
    debug(...msg: [unknown, ...unknown[]]): void;
    /**
     * Log informational message
     */
    info(...msg: [unknown, ...unknown[]]): void;
    /**
     * Log warning message
     */
    warning(...msg: [unknown, ...unknown[]]): void;
    /**
     * Log error message
     */
    error(...msg: [unknown, ...unknown[]]): void;
    /**
     * base log function
     */
    log(level: logLevels, ...messageParts: unknown[]): void;
    private _checkLogLevel;
    private stringify;
}
