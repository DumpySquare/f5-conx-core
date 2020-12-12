/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import path from 'path';
import https from 'https';
import * as fs from 'fs';
import { EventEmitter } from 'events';

import axios, { AxiosRequestConfig } from 'axios';
import timer from '@szmarczak/http-timer/dist/source';

import { Token, F5DownLoad, F5Upload, F5InfoApi } from './bigipModels';
import { HttpResponse, F5HttpRequest } from "../utils/httpModels";
import { F5DownloadPaths, F5UploadPaths } from '../constants';
import { getRandomUUID } from '../utils/misc';


/**
 * Used to inject http call timers
 * transport:request: httpsWithTimer
 * @szmarczak/http-timer
 */
const transport = {
    request: function httpsWithTimer(...args: unknown[]): AxiosRequestConfig {
        const request = https.request.apply(null, args)
        timer(request);
        return request;
    }
};



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
    hostInfo: F5InfoApi | undefined;
    events: EventEmitter;
    protected _user: string;
    protected _password: string;
    protected _provider: string;
    protected _token: Token | undefined;
    protected _tokenTimeout: number | undefined;
    protected _tokenIntervalId: NodeJS.Timeout | undefined;
    private _asyncRetry = {
        max: 30,
        interval: 3
    }


    /**
     * @param options function options
     */
    constructor(
        host: string,
        user: string,
        password: string,
        options?: {
            port?: number,
            provider?: string,
        }
    ) {
        this.host = host;
        this._user = user;
        this._password = password;
        this.port = options?.port || 443;
        this._provider = options?.provider || 'tmos';
        this.events = new EventEmitter;
    }

    /**
     * 
     * @return event emitter instance
     */
    getEvenEmitter(): EventEmitter {
        return this.events;
    }


    /**
     * clear auth token and timer
     *  - used for logging out/disconnecting, and testing
     */
    async clearToken(): Promise<void> {

        this.events.emit('log-debug', `clearing token/timer`);
        clearInterval(this._tokenIntervalId);
        this._token = undefined;
    }




    /**
     * sets/gets/refreshes auth token
     */
    private async getToken(): Promise<void> {

        this.events.emit('log-debug', `getting auth token from: ${this.host}:${this.port}`);

        return await axios({
            baseURL: `https://${this.host}:${this.port}`,
            url: '/mgmt/shared/authn/login',
            method: 'POST',
            data: {
                username: this._user,
                password: this._password,
                loginProviderName: this._provider
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            transport
        })
            .then(resp => {

                // capture entire token
                this._token = resp.data['token'];
                // set token timeout for timer
                this._tokenTimeout = resp.data.token.timeout;

                this.tokenTimer();  // start token timer

                return;

            })
            .catch(err => {

                // if we got a failed password response
                if (
                    err.response?.status === 401 &&
                    err.response?.data.message === 'Authentication failed.'
                ) {

                    // fire failed password event so upper logic can clear details
                    // this.events.emit('failedAuth');
                    this.events.emit('failedAuth', err.response.data);
                }

                this.events.emit('log-error', `token request failed: ${err.message}`);

                // todo: add non http error details to log
                // return err;

                // reThrow the error back up the chain
                return Promise.reject(err)
            })

    }





    /**
     * Make HTTP request
     * 
     * @param uri     request URI
     * @param options axios options
     * 
     * @returns request response
     */
    async makeRequest(uri: string, options?: F5HttpRequest): Promise<HttpResponse> {

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }

        // todo: add logic to watch for failed/broken tokens, clear token when needed
        // be able to clear the token if it expires before timer

        // build a uuid for this call (if we didn't get one from a higher call), this will be applied to the logging
        //  so we can uniquely identify each request/response pair
        // options.uuid = options?.uuid ? options.uuid : getRandomUUID(4, { simple: true })
        // uuid = uuid || getRandomUUID(4, { simple: true });

        // this.logger.debug(`HTTPS-REQUEST [${options.uuid}]: ${options?.method || 'GET'} -> ${this.host}:${this.port}${uri}`);


        const requestDefaults = {
            baseURL: `https://${this.host}:${this.port}`,
            url: uri,
            method: options?.method || undefined,
            headers: Object.assign(options?.headers || {}, {
                'X-F5-Auth-Token': this._token?.token
            }),
            data: options?.data || undefined,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            transport
        }

        // merge incoming options into requestDefaults object
        options = Object.assign(requestDefaults, options)

        // inject a uuid if we don't have one already
        options.uuid = options?.uuid ? options.uuid : getRandomUUID(4, { simple: true })

        this.events.emit('log-debug', `HTTPS-REQU [${options.uuid}]: ${options?.method || 'GET'} -> ${this.host}:${this.port}${uri}`);

        return await axios(options)
            .then(resp => {

                // log response
                this.events.emit('log-debug', `HTTPS-RESP [${options.uuid}]: ${resp.status} - ${resp.statusText}`);

                return resp;
            })
            .catch(err => {

                // todo: rework this to build a singe err-response object to be passed back as an event

                // https://github.com/axios/axios#handling-errors
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    this.events.emit('log-debug', `HTTPS-RESP [${options.uuid}]: ${err.response.status} - ${JSON.stringify(err.response.data)}`)
                    // return Promise.reject(err.response)

                } else if (err.request) {

                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    this.events.emit('log-debug', `HTTPS-REQUEST-FAILED [${options.uuid}]: ${JSON.stringify(err.request)}`)
                    // return Promise.reject(err.request)

                } else {

                    // got a lower level failure
                    this.events.emit('log-debug', `HTTPS request failed [${options.uuid}]: ${JSON.stringify(err)}`)

                }
                return Promise.reject(err)

                // thought:  just log the individual situations and have a single reject clause like below
                // return Promise.reject({
                //     message: 'HTTPS request failed',
                //     uuid,
                //     err
                // })

            })
    }





    /**
     * bigip auth token lifetime countdown
     * will clear auth token details when finished
     * prompting the next http call to get a new token
     */
    private async tokenTimer(): Promise<void> {

        this.events.emit('log-debug', `Starting token timer: ${this._tokenTimeout}`);

        this._tokenIntervalId = setInterval(() => {
            this._tokenTimeout--;

            // todo: add event to imit timer countdown

            if (this._tokenTimeout <= 0) {
                clearInterval(this._tokenIntervalId);
                this._token = undefined; // clearing token details should get a new token
                this.events.emit('log-debug', 'authToken expired:', this._tokenTimeout);
            }
            // run timer a little fast to pre-empt update
        }, 999);

    }






    async followAsync(url: string): Promise<HttpResponse> {

        if (!this._token) {
            await this.getToken();
        }


        let i = 0;  // loop counter
        let resp: HttpResponse;
        // use taskId to control loop
        while (i < this._asyncRetry.max) {

            // set makeRequest to never throw an error, but keep going till a valid response

            resp = await this.makeRequest(url);

            // be thinking about expanding this to accomodate all flows like DO/ILX/... install
            //  where there could be catastrophic responses (network timeouts/tcp rejects/http errors)
            // if the job kicked off right (since we got here), then keep trying till we get some reponse

            // if ILX install follow services restart...
            // if DO follow device restart...


            // todo: break out the successful and failed results, only refresh statusBars on successful
            if (resp.data.status === 'FINISHED' || resp.data.status === 'FAILED') {

                return resp;
            }

            i++;
            await new Promise(resolve => { setTimeout(resolve, this._asyncRetry.interval); });
        }

        // debugger;
        return resp;
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

        // swap out download url as needed (ternary method)
        const url =
            downloadType === 'UCS' ? `${F5DownloadPaths.ucs.uri}/${fileName}`
                : downloadType === 'QKVIEW' ? `${F5DownloadPaths.qkview.uri}/${fileName}`
                    : `${F5DownloadPaths.iso.uri}/${fileName}`;


        const writable = fs.createWriteStream(localDestPath)

        return new Promise(((resolve, reject) => {

            this.makeRequest(url, { responseType: 'stream' })
                .then(resp => {
                    resp.data.pipe(writable)
                        // .on('finish', resolve)
                        .on('finish', () => {

                            // over-write response data
                            resp.data = {
                                file: writable.path,
                                bytes: writable.bytesWritten
                            };

                            return resolve(resp);
                        });
                })
                .catch(err => {
                    // look at adding more failure details, like,
                    // was it tcp, dns, dest url problem, write file problem, ...
                    return reject(err)
                })
        }));
    }



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
     * 
     * @param localSourcePathFilename 
     * @param uploadType
     */
    async upload(localSourcePathFilename: string, uploadType: F5Upload): Promise<HttpResponse> {

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }

        // array to hold responses
        const responses = [];
        const fileName = path.parse(localSourcePathFilename).base;
        const fileStats = fs.statSync(localSourcePathFilename);
        const chunkSize = 1024 * 1024;
        let start = 0;
        let end = Math.min(chunkSize, fileStats.size - 1);

        const url =
            uploadType === 'FILE'
                ? `${F5UploadPaths.file.uri}/${fileName}`
                : `${F5UploadPaths.iso.uri}/${fileName}`;

        while (end <= fileStats.size - 1 && start < end) {

            const resp = await this.makeRequest(url, {
                method: 'POST',
                headers: {
                    'X-F5-Auth-Token': this._token.token,
                    'Content-Type': 'application/octet-stream',
                    'Content-Range': `${start}-${end}/${fileStats.size}`,
                    'Content-Length': end - start + 1
                },
                data: fs.createReadStream(localSourcePathFilename, { start, end }),
                contentType: 'raw'
            });

            start += chunkSize;
            if (end + chunkSize < fileStats.size - 1) { // more to go
                end += chunkSize;
            } else if (end + chunkSize > fileStats.size - 1) { // last chunk
                end = fileStats.size - 1;
            } else { // done - could use do..while loop instead of this
                end = fileStats.size;
            }
            responses.push(resp);
        }

        // get the last response
        const lastResponse = responses.pop();

        // inject file stream information
        lastResponse.data.fileName = fileName;
        lastResponse.data.bytes = fileStats.size;

        return lastResponse;
    }



    /**
     * this funciton is used to build a filename for with all necessary host specific details
     *   for files like ucs/qkviews
     * @returns string with `${this.hostname}_${this.host}_${cleanISOdateTime}`
     * @example bigip1_10.200.244.101_20201127T220451142Z
     */
    async getFileName(): Promise<string> {

        if (this.hostInfo) {
            // start with ISO Date and remove ":", ".", and "-"
            const cleanISOdateTime = new Date().toISOString().replace(/(:|\.|-)/g, '')

            // if mgmtIP is IPv6 format - make it filename friendly
            if (/\[[\w:]+\]/.test(this.hostInfo.managementAddress)) {

                const removedBrackets = this.hostInfo.managementAddress.replace(/\[|\]/g, '')
                const flat = removedBrackets.replace(/:/g, '.')
                return `${this.hostInfo.hostname}_${flat}_${cleanISOdateTime}`;

            } else {

                return `${this.hostInfo.hostname}_${this.hostInfo.managementAddress}_${cleanISOdateTime}`;

            }
        }
    }
}