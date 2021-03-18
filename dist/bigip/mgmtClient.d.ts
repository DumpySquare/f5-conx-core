/// <reference types="node" />
import { EventEmitter } from 'events';
import { AxiosInstance } from 'axios';
import { Token, F5DownLoad, F5Upload, F5InfoApi } from './bigipModels';
import { HttpResponse, uuidAxiosRequestConfig, AxiosResponseWithTimings } from "../utils/httpModels";
/**
 * F5 connectivity mgmt client
 *
 * @param host
 * @param user
 * @param password
 * @param options.port (default = 443)
 * @param options.provider (default = tmos)
 *
 */
export declare class MgmtClient {
    /**
     * hostname or IP address of F5 device
     */
    host: string;
    /**
     * tcp port for mgmt connectivity (default=443)
     */
    port: number;
    /**
     * F5 Device host information api output from
     *
     * '/mgmt/shared/identified-devices/config/device-info'
     *
     * Used to understand details of connected device
     */
    hostInfo: F5InfoApi | undefined;
    /**
     * event emitter instance for all events related to this class
     *
     * typically passed in from parent F5Client class
     */
    events: EventEmitter;
    /**
     * custom axsios instance for making calls to the connect F5 device
     *
     * managed authentication/token
     */
    axios: AxiosInstance;
    /**
     * username for connected f5 device
     */
    protected _user: string;
    /**
     * password for connected device
     */
    protected _password: string;
    /**
     * authentication provider for connected device
     */
    protected _provider: string;
    /**
     * full auth token details for connected device
     *
     * **this gets cleared and refreshed as needed**
     *
     * **check out the auth token events for active otken feedback**
     */
    protected _token: Token | undefined;
    /**
     * token timer value
     *
     * Starts when a token is refreshed, start value is token time out
     *
     * An asyncronous timer counts down till zero
     *
     */
    tokenTimeout: number | undefined;
    /**
     * system interval id for the async token timer
     *
     * **pre-emptivly clears token at <10 seconds but keeps counting to zero**
     */
    protected _tokenIntervalId: NodeJS.Timeout | undefined;
    /**
     * @param options function options
     */
    constructor(host: string, user: string, password: string, options?: {
        port?: number;
        provider?: string;
    }, eventEmitter?: EventEmitter);
    /**
     *
     * @return event emitter instance
     */
    getEvenEmitter(): EventEmitter;
    /**
     * clear auth token and timer
     *  - used for logging out/disconnecting, and testing
     */
    clearToken(): Promise<number>;
    /**
     * creates the axios instance that will be used for all f5 calls
     *
     * includes auth/token management
     */
    private createAxiosInstance;
    /**
     * sets/gets/refreshes auth token
     */
    private getToken;
    /**
     * Make HTTP request
     *
     * @param uri     request URI
     * @param options axios options
     *
     * @returns request response
     */
    makeRequest(uri: string, options?: uuidAxiosRequestConfig): Promise<AxiosResponseWithTimings>;
    /**
     * bigip auth token lifetime countdown
     * will clear auth token details when finished
     * prompting the next http call to get a new token
     */
    private tokenTimer;
    followAsync(url: string): Promise<AxiosResponseWithTimings>;
    /**
     * download file (multi-part) from f5 (ucs/qkview/iso)
     * - UCS
     *   - uri: /mgmt/shared/file-transfer/ucs-downloads/${fileName}
     *   - path: /var/local/ucs/${fileName}
     * - QKVIEW
     *   - uri: /mgmt/cm/autodeploy/qkview-downloads/${fileName}
     *   - path: /var/tmp/${fileName}
     * - ISO
     *   - uri: /mgmt/cm/autodeploy/software-image-downloads/${fileName}
     *   - path: /shared/images/${fileName}
     *
     *   **I don't think any of the f5 download paths support non-multipart**
     *
     * https://support.f5.com/csp/article/K41763344
     *
     * @param fileName file name on bigip
     * @param localDestPathFile where to put the file (including file name)
     * @param downloadType: type F5DownLoad = "UCS" | "QKVIEW" | "ISO"
     * **expand/update return value**
     */
    download(fileName: string, localDestPath: string, downloadType: F5DownLoad): Promise<HttpResponse>;
    /**
     * upload file to f5 -> used for ucs/ilx-rpms/.conf-merges
     *
     * types of F5 uploads
     * - FILE
     *  - uri: '/mgmt/shared/file-transfer/uploads'
     *  - path: '/var/config/rest/downloads'
     * - ISO
     *  - uri: '/mgmt/cm/autodeploy/software-image-uploads'
     *  - path: '/shared/images'
     * - UCS
     *  - uri: '/mgmt/shared/file-transfer/ucs-uploads/'
     *  - path: '/var/local/ucs'
     *
     * https://devcentral.f5.com/s/articles/demystifying-icontrol-rest-part-5-transferring-files
     * https://support.f5.com/csp/article/K41763344
     * https://www.devcentral.f5.com/s/articles/Tinkering-with-the-BIGREST-Python-SDK-Part-2
     * @param localSourcePathFilename
     * @param uploadType
     */
    upload(localSourcePathFilename: string, uploadType: F5Upload): Promise<AxiosResponseWithTimings>;
    /**
     * this funciton is used to build a filename for with all necessary host specific details
     *   for files like ucs/qkviews
     * @returns string with `${this.hostname}_${this.host}_${cleanISOdateTime}`
     * @example bigip1_10.200.244.101_20201127T220451142Z
     */
    getFileName(): Promise<string>;
}
/**
 * returns simplified http response object
 *
 * ```ts
 *     return {
 *      data: resp.data,
 *      headers: resp.headers,
 *      status: resp.status,
 *      statusText: resp.statusText,
 *      request: {
 *          uuid: resp.config.uuid,
 *          baseURL: resp.config.baseURL,
 *          url: resp.config.url,
 *          method: resp.request.method,
 *          headers: resp.config.headers,
 *          protocol: resp.config.httpsAgent.protocol,
 *          timings: resp.request.timings
 *      }
 *  }
 * ```
 * @param resp orgininal axios response with timing
 * @returns simplified http response
 */
export declare function simplifyHttpResponse(resp: AxiosResponseWithTimings): Promise<HttpResponse>;
