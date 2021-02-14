/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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


import { Token, F5InfoApi, F5DownLoad } from './bigipModels';
import { F5DownloadPaths } from '../constants';
// import { HttpResponse, uuidAxiosRequestConfig, AxiosResponseWithTimings } from "../utils/httpModels";





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
export class NewMgmtClient {
    host: string;
    port: number;
    events: EventEmitter;
    protected _user: string;
    protected _password: string;
    protected _provider: string;
    protected _token: Token | undefined;
    protected _tokenTimeout: number | undefined;
    protected _tokenIntervalId: NodeJS.Timeout | undefined;


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
        // this.axios = this.createAxiosInstance();
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
    async clearToken(): Promise<number> {
        this.events.emit('log-info', `clearing token/timer with ${this._tokenTimeout} left`);
        const tokenTimeOut = this._tokenTimeout;
        this._token = undefined;
        clearInterval(this._tokenIntervalId);
        return tokenTimeOut;
    }




    /**
     * sets/gets/refreshes auth token
     */
    private async getToken() {
        //

        const payload = {
            username: this._user,
            password: this._password,
            loginProviderName: this._provider
        }

        return new Promise((resolve, reject) => {

            const request = https.request({
                path: '/mgmt/shared/authn/login',
                host: this.host,
                port: this.port,
                rejectUnauthorized: false,
                headers: {
                    'content-type': 'application/json'
                },
                method: 'POST',

            }, resp => {
                const buffer: any = [];
                resp.on("data", chunk => {
                    buffer.push(chunk)
                })
                resp.on("end", () => {
                    let data = buffer.join('');
                    data = data || '{}';

                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        console.log(e);
                        debugger;
                    }
                    // capture entire token
                    this._token = data.token;
                    // set token timeout for timer
                    this._tokenTimeout = data.token.timeout;

                    this.events.emit('log-debug', `auth token aquired, timeout: ${this._tokenTimeout}`);

                    // this.tokenTimer();  // start token timer

                    if (resp.statusCode) {
                        return resolve({
                            status: resp.statusCode,
                            headers: resp.headers,
                            data
                        });
                    } else {
                        console.error(`HTTP FAILURE: ${resp.statusCode} - ${resp.statusMessage}`);
                        return reject(new Error(`HTTP - ${resp.statusCode} - ${resp.statusMessage}`));
                    }
                })
            });

            request.on('error', e => {
                // might need to stringify combOpts for proper log output
                debugger;
            });

            // if a payload was passed in, post it!
            if (payload) {
                request.write(JSON.stringify(payload));
            }
            request.end();
        });
    }



    async makeRequest(uri: string) {

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }

        return new Promise((resolve, reject) => {
            const request = https.request({
                host: this.host,
                port: this.port,
                rejectUnauthorized: false,
                headers: {
                    'x-f5-auth-token': this._token?.token
                },
                path: uri,
                method: 'GET',
            }, resp => {
                const buffer = [];
                resp.on("data", data => {
                    buffer.push(data)
                })
                resp.on("end", () => {
                    let data = buffer.join('');

                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        console.log(e);
                        debugger;
                    }

                    if (resp.statusCode) {
                        return resolve({
                            status: resp.statusCode,
                            headers: resp.headers,
                            data
                        });
                    } else {
                        console.error(`HTTP FAILURE: ${resp.statusCode} - ${resp.statusMessage}`);
                        return reject(new Error(`HTTP - ${resp.statusCode} - ${resp.statusMessage}`));
                    }
                })
            });

            request.on('error', e => {
                // might need to stringify combOpts for proper log output
                debugger;
            });

            request.end();
        });
    }


    async download(fileName: string, localDestPath: string, downloadType: F5DownLoad) {

        // if auth token has expired, it should have been cleared, get new one
        if (!this._token) {
            await this.getToken();
        }


        // swap out download url as needed (ternary method)
        const url =
            downloadType === 'UCS' ? `${F5DownloadPaths.ucs.uri}/${fileName}`
                : downloadType === 'QKVIEW' ? `${F5DownloadPaths.qkview.uri}/${fileName}`
                    : `${F5DownloadPaths.iso.uri}/${fileName}`;

        //  if we got a dest path with no filename, append the filename
        const fileP
            = path.parse(localDestPath).ext
                ? localDestPath
                : `${localDestPath}/${fileName}`;

        const options = {
            host: this.host,
            port: this.port,
            rejectUnauthorized: false,
            headers: {
                'x-f5-auth-token': this._token?.token
            },
            path: url,
            method: 'GET',
        }

        this.events.emit('log-debug', {
            message: 'pending download',
            fileName,
            localDestPath,
            downloadType
        })


        const resps = [];

        // const resp = await axios.request(options)

        return new Promise(((resolve, reject) => {
            const writable = fs.createWriteStream(fileP)
            const request = https.request(options, resp => {

                resps.push(resp);

                resp.pipe(writable)
                // .on('finish', resolve)
                writable
                    .on('finish', () => {

                        // over-write response data
                        // resp.data = {
                        //     file: writable.path,
                        //     bytes: writable.bytesWritten
                        // };

                        this.events.emit('log-debug', {
                            message: 'download complete',
                            // data: resp.data
                        })

                        return resolve('resp');
                    })
                    .on('error', err => {
                        debugger;
                        return reject(err);
                    });
            })
            request.on('error', e => {
                // might need to stringify combOpts for proper log output
                debugger;
            });
    
            request.end();
        }));

    // });
    }





    // /**
    //  * bigip auth token lifetime countdown
    //  * will clear auth token details when finished
    //  * prompting the next http call to get a new token
    //  */
    // private async tokenTimer(): Promise < void> {

    // this.events.emit('log-debug', `Starting token timer: ${this._tokenTimeout}`);

    // this._tokenIntervalId = setInterval(() => {
    //     this._tokenTimeout--;

    //     // todo: add event to emit timer countdown

    //     if (this._tokenTimeout <= 0) {
    //         clearInterval(this._tokenIntervalId);
    //         this._token = undefined; // clearing token details should get a new token
    //         this.events.emit('log-debug', 'authToken expired:', this._tokenTimeout);
    //     }
    //     // run timer a little fast to pre-empt update
    //     }, 999);

    // }




}