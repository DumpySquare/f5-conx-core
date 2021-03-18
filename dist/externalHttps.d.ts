/// <reference types="node" />
import { EventEmitter } from 'events';
import { AxiosProxyConfig } from 'axios';
import { HttpResponse, uuidAxiosRequestConfig } from "./utils/httpModels";
/**
 * Class for making all external HTTP calls
 * @constructor options.rejectUnauthorized - set to false to allow self-signed certs (default true)
 */
export declare class ExtHttp {
    /**
     * http user agent to identify connections
     *
     * set via process.env.F5_CONX_CORE_EXT_HTTP_AGENT
     *
     * default => 'F5 Conx Core'
     */
    userAgent: string;
    /**
     * event emitter instance
     */
    events: EventEmitter;
    /**
     * axios instance for making all external https calls
     */
    private axios;
    /**
     * cache directory for default download directory
     */
    cacheDir: string;
    /**
     * external https proxy configuration settings, based on axios proxy config
     * # in dev
     */
    proxy: AxiosProxyConfig | undefined;
    constructor(options?: {
        rejectUnauthorized?: boolean;
        eventEmitter?: EventEmitter;
    });
    /**
     * core external axios instance
     * @param reqBase
     */
    private createAxiosInstance;
    /**
     * Make External HTTP request
     *
     * @param url absolute url
     * @param options axios options
     *
     * @returns request response
     */
    makeRequest(options: uuidAxiosRequestConfig): Promise<HttpResponse>;
    /**
     * download file from external (not f5)
     * @param url fully qualified URL
     * @param fileName (optional) destination file name - if you want it different than url
     * @param destPath (optional) where to put the file (default is local project cache folder)
     * @param options axios requestion options
     */
    download(url: string, fileName?: string, destPath?: string, options?: uuidAxiosRequestConfig): Promise<HttpResponse>;
    /**
     *
     * @param url
     * @param localSourcePathFilename
     */
    upload(url: string, localSourcePathFilename: string): Promise<HttpResponse>;
}
