import { AxiosResponseWithTimings, uuidAxiosRequestConfig } from './utils/httpModels';
/**
 * logLevel definitions
 */
export declare type logLevels = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
/**
 *
 * Basic Example:
 *
 * ```ts
 * // set logging to debug
 * process.env.F5_CONX_CORE_LOG_LEVEL = 'DEBUG';
 * // create OUTPUT channel
 * const f5OutputChannel = window.createOutputChannel('nginx');
 * // make visible
 * f5OutputChannel.show();
 * // inject vscode output into logger
 * logger.output = function (log: string) {
 *     f5OutputChannel.appendLine(log);
 * };
 * ```
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
     *
     * log http request information depending on env logging level (info/debug)
     *
     * ex. process.env.F5_CONX_CORE_LOG_LEVEL === 'INFO/DEBUG'
     *
     * @param config
     */
    httpRequest(config: uuidAxiosRequestConfig): Promise<void>;
    /**
     *
     * log http response information depending on env logging level (info/debug)
     *
     * ex. process.env.F5_CONX_CORE_LOG_LEVEL === 'INFO/DEBUG'
     *
     * @param resp
     */
    httpResponse(resp: AxiosResponseWithTimings): Promise<void>;
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
     *
     * ```ts
     * // inject vscode output into logger
     * logger.output = function (log: string) {
     *     f5OutputChannel.appendLine(log);
     * };
     * ```
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
