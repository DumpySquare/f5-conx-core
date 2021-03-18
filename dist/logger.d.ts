/**
 * logLevel definitions
 */
export declare type logLevels = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
export declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}
/**
 *
 * Basic Example:
 *
 * ```bash
 * export F5_CONX_CORE_LOG_LEVEL='DEBUG'
 * ```
 */
export default class Logger {
    readonly journal: any[];
    /**
     * buffer log messages
     * @default true
     */
    buffer: boolean;
    /**
     * output log messages to console
     * @default true
     */
    console: boolean;
    private static instance;
    /**
     * Get logger instance (singleton)
     *
     * @param options.buffer enable/disable buffering
     * @param options.console enable/disable output to console.log
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
    /** base log function
     *
     */
    log(level: logLevels, ...messageParts: unknown[]): void;
    private _checkLogLevel;
    private stringify;
}
