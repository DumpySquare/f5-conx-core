/// <reference types="node" />
import { EventEmitter } from 'events';
import { AxiosInstance } from 'axios';
import { Token, F5DownLoad, F5Upload, F5InfoApi } from './bigipModels';
import { HttpResponse, uuidAxiosRequestConfig } from "../utils/httpModels";
/**
 * F5 connectivity mgmt client
 *
 * @param host
 * @param port
 * @param user
 * @param options.password
 * @param options.provider
 *
 */
export declare class MgmtClient {
    host: string;
    port: number;
    hostInfo: F5InfoApi | undefined;
    events: EventEmitter;
    axios: AxiosInstance;
    protected _user: string;
    protected _password: string;
    protected _provider: string;
    protected _token: Token | undefined;
    protected _tokenTimeout: number | undefined;
    protected _tokenIntervalId: NodeJS.Timeout | undefined;
    /**
     * @param options function options
     */
    constructor(host: string, user: string, password: string, options?: {
        port?: number;
        provider?: string;
    });
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
    makeRequest(uri: string, options?: uuidAxiosRequestConfig): Promise<HttpResponse>;
    /**
     * bigip auth token lifetime countdown
     * will clear auth token details when finished
     * prompting the next http call to get a new token
     */
    private tokenTimer;
    followAsync(url: string): Promise<HttpResponse>;
    /**
     *
     * https://support.f5.com/csp/article/K41763344
     *
     *
     */
    /**
     * download file from f5 (ucs/qkview/iso)
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
     * @param fileName file name on bigip
     * @param localDestPathFile where to put the file (including file name)
     * @param downloadType: type F5DownLoad = "UCS" | "QKVIEW" | "ISO"
     */
    download(fileName: string, localDestPath: string, downloadType: F5DownLoad): Promise<any>;
    /**
     * download file from f5 (ucs/qkview/iso)
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
     * @param fileName file name on bigip
     * @param localDestPathFile where to put the file (including file name)
     * @param downloadType: type F5DownLoad = "UCS" | "QKVIEW" | "ISO"
     */
    downloadNew(fileName: string, localDestPath: string, downloadType: F5DownLoad): Promise<any>;
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
     *
     * https://devcentral.f5.com/s/articles/demystifying-icontrol-rest-part-5-transferring-files
     * https://support.f5.com/csp/article/K41763344
     * @param localSourcePathFilename
     * @param uploadType
     */
    upload(localSourcePathFilename: string, uploadType: F5Upload): Promise<HttpResponse>;
    /**
     * this funciton is used to build a filename for with all necessary host specific details
     *   for files like ucs/qkviews
     * @returns string with `${this.hostname}_${this.host}_${cleanISOdateTime}`
     * @example bigip1_10.200.244.101_20201127T220451142Z
     */
    getFileName(): Promise<string>;
}
