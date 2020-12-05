/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import * as f5Https from '../utils/f5Https';
import { Token, F5DownLoad } from './bigipModels';
import { HttpResponse, F5HttpRequest } from "../utils/httpModels";
import { F5DownloadPaths } from '../constants';


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
export class MgmtClient {
    host: string;
    port: number;
    hostname: string;
    mgmtIP: string;
    version: string;
    protected _user: string;
    protected _password: string;
    protected _provider: string;
    protected _token: Token;
    protected _tokenTimeout: number;
    protected _tokenIntervalId: NodeJS.Timeout;


    /**
     * @param options function options
     */
    constructor(
        host: string,
        user: string,
        password: string,
        options?: {
            port?: number;
            provider?: string;
        }
    ) {
        this.host = host;
        this._user = user;
        this._password = password;
        this.port = options?.port || 443;
        this._provider = options?.provider || 'tmos';
    }


    /**
     * clear auth token and timer
     *  - used for logging out/disconnecting, and testing
     */
    async clearToken(): Promise<void> {
        clearInterval(this._tokenIntervalId);
        return this._token = undefined;
    }

    // setHostname(hostname: string) {
    //     this.hostname = hostname;
    // }




    /**
     * sets/gets/refreshes auth token
     */
    private async getToken(): Promise<void> {

        // logger.debug('getting auth token from: ', `${this.host}:${this.port}`);

        const resp = await f5Https.makeRequest(
            {
                baseURL: `https://${this.host}:${this.port}`,
                url: '/mgmt/shared/authn/login',
                method: 'POST',
                data: {
                    username: this._user,
                    password: this._password,
                    loginProviderName: this._provider
                }
            }
        );

        // capture entire token
        this._token = resp.data['token'];
        // set token timeout for timer
        this._tokenTimeout = this._token.timeout;

        this.tokenTimer();  // start token timer
    }





    /**
     * bigip auth token lifetime countdown
     * will clear auth token details when finished
     * prompting the next http call to get a new token
     */
    private async tokenTimer(): Promise<void> {

        this._tokenIntervalId = setInterval(() => {
            this._tokenTimeout--;
            if (this._tokenTimeout <= 0) {
                clearInterval(this._tokenIntervalId);
                this._token = undefined; // clearing token details should get a new token
                console.log('authToken expired', this._tokenTimeout);
            }
            // run timer a little fast to pre-empt update
        }, 999);
    }




    /**
     * Make HTTP request
     * 
     * @param uri     request URI
     * @param options function options
     * 
     * @returns request response
     */
    async makeRequest(uri: string, options?: F5HttpRequest): Promise<HttpResponse> {
        // options = options || {};

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }

        // todo: add logic to watch for failed/broken tokens, clear token when needed
        // be able to clear the token if it expires before timer

        return await f5Https.makeRequest(
            {
                baseURL: `https://${this.host}:${this.port}`,
                url: uri,
                method: options?.method || undefined,
                // port: this.port,
                headers: Object.assign(options?.headers || {}, {
                    'X-F5-Auth-Token': this._token.token
                }),
                data: options?.data || undefined,
                advancedReturn: options?.advancedReturn || false
            }
        );
    }


    async followAsync(url: string): Promise<HttpResponse> {

        if (!this._token) {
            await this.getToken();
        }

        // base request object
        const requestObject: F5HttpRequest = {
            baseURL: `https://${this.host}:${this.port}`,
            url,
            headers: {
                'X-F5-Auth-Token': this._token.token
            },
        }
        return await f5Https.followAsyncCall(requestObject);
    }



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
    async download(fileName: string, localDestPath: string, downloadType: F5DownLoad): Promise<HttpResponse> {

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }

        // base request object
        const requestObject: F5HttpRequest = {
            baseURL: `https://${this.host}:${this.port}`,
            headers: {
                'X-F5-Auth-Token': this._token.token
            },
            responseType: 'stream'
        }

        // swap out download url as needed (ternary method)
        requestObject.url
            = downloadType === 'UCS' ? `${F5DownloadPaths.ucs.uri}/${fileName}`
                : downloadType === 'QKVIEW' ? `${F5DownloadPaths.qkview.uri}/${fileName}`
                    : `${F5DownloadPaths.iso.uri}/${fileName}`;

        return await f5Https.downloadToFile(localDestPath, requestObject)
    }




    /**
     * upload file to f5
     *  - POST	/mgmt/shared/file-transfer/uploads/{file}
     *  - path on f5: /var/config/rest/downloads
     * 
     * https://devcentral.f5.com/s/articles/demystifying-icontrol-rest-part-5-transferring-files
     * 
     * @param fileName file name on bigip
     * @param localDestPathFile where to put the file (including file name)
     */
    async upload(localSourcePathFilename: string): Promise<HttpResponse> {

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }

        return await f5Https.uploadFile(localSourcePathFilename, this.host, this.port, this._token.token)
    }



    /**
     * this funciton is used to build a filename for with all necessary details
     *   for files like ucs/qkviews/
     * @returns string with `${this.hostname}_${this.host}_${cleanISOdateTime}`
     * @example bigip1_10.200.244.101_20201127T220451142Z
     */
    async getFileName(): Promise<string> {

        // start with ISO Date and remove ":", ".", and "-"
        const cleanISOdateTime = new Date().toISOString().replace(/(:|\.|-)/g, '')
        
        // if mgmtIP is IPv6 format - make it filename friendly
        if(/\[[\w:]+\]/.test(this.mgmtIP)) {

            const removedBrackets = this.mgmtIP.replace(/\[|\]/g, '')
            const flat = removedBrackets.replace(/:/g, '.')
            return `${this.hostname}_${flat}_${cleanISOdateTime}`;

        } else {

            return `${this.hostname}_${this.mgmtIP}_${cleanISOdateTime}`;

        }
    }
}