
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { EventEmitter } from 'events';

import { AtcMetaData, AtcInfo, F5InfoApi, F5DownLoad, F5Upload } from "./bigipModels";
import { HttpResponse, F5HttpRequest } from "../utils/httpModels";
// import { MetadataClient } from "./metadata";

import { MgmtClient } from "./mgmtClient";
import { UcsClient } from "./ucsClient";
import { QkviewClient } from "./qkviewClient";
import { FastClient } from "./fastClient";
import { As3Client } from "./as3Client";
import { DoClient } from "./doClient";
import { TsClient } from "./tsClient";
import { CfClient } from "./cfClient";

import localAtcMetadata from './atc_metadata.json';


/**
 *  Main F5 connectivity client
 * 
 * Basic Example:
 * 
 * ```
 * const mgmtClient = new f5Client(
 *      host: '192.0.2.1',
 *      user: 'admin',
 *      password: 'admin', 
 *      {
 *          port: 8443,
 *          provider: 'tmos'
 *      }
 * );
 * await f5Client.discover();
 * const resp = await f5Client.makeRequest('/mgmt/tm/sys/version');
 * ```
*/
export class F5Client {
    protected _mgmtClient: MgmtClient;
    // protected _metadataClient: MetadataClient;
    protected _atcMetaData: AtcMetaData = localAtcMetadata;
    host: F5InfoApi | undefined;
    ucs: UcsClient;
    qkview: QkviewClient;
    fast: FastClient | undefined;
    as3: As3Client | undefined;
    do: DoClient | undefined;
    ts: TsClient | undefined;
    cf: CfClient | undefined;
    events: EventEmitter;

    constructor(
        host: string,
        user: string,
        password: string,
        options?: {
            port?: number,
            provider?: string,
        }
    ) {
        this._mgmtClient = new MgmtClient(
            host,
            user,
            password,
            options
        )

        // get event emitter instance from mgmtClient
        this.events = this._mgmtClient.getEvenEmitter();
    }


    
    /**
     * clear auth token
     *  - mainly for unit tests...
     */
    async clearLogin(): Promise<number> {
        return this._mgmtClient.clearToken();
    }



    /**
     * Make HTTP request
     * 
     * @param uri     request URI
     * @param options function options
     * 
     * @returns request response
     */
    async https(uri: string, options?: F5HttpRequest): Promise<HttpResponse> {
        return await this._mgmtClient.makeRequest(uri, options)
    }


    /**
     * discover information about device
     *  - bigip/bigiq/nginx?
     *  - tmos/nginx version
     *  - installed atc services and versions
     *  
     */
    async discover(): Promise<void> {

        // get device info
        await this._mgmtClient.makeRequest('/mgmt/shared/identified-devices/config/device-info')
            .then(resp => {

                // assign details to this and mgmtClient class
                this.host = resp.data
                this._mgmtClient.hostInfo = resp.data
            })


        // setup ucsClient
        this.ucs = new UcsClient(this._mgmtClient)

        // setup qkviewClient
        this.qkview = new QkviewClient(this._mgmtClient)



        // check FAST installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.fast.endpoints.info.uri)
            .then(resp => {
                this.fast = new FastClient(resp.data as AtcInfo, this._atcMetaData.components.fast, this._mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })

        // check AS3 installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.as3.endpoints.info.uri)
            .then(resp => {
                // if http 2xx, create as3 client
                // notice the recast of resp.data type of "unknown" to "AtcInfo"
                this.as3 = new As3Client(resp.data as AtcInfo, this._atcMetaData.components.as3, this._mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        // check DO installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.do.endpoints.info.uri)
            .then(resp => {
                this.do = new DoClient(resp.data[0] as AtcInfo, this._atcMetaData.components.do, this._mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        // check TS installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.ts.endpoints.info.uri)
            .then(resp => {
                this.ts = new TsClient(resp.data as AtcInfo, this._atcMetaData.components.ts, this._mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        // check CF installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.cf.endpoints.info.uri)
            .then(resp => {
                this.cf = new CfClient(resp.data as AtcInfo, this._atcMetaData.components.cf, this._mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        return;
        // return object of discovered services
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
     * @param localSourcePathFilename 
     * @param uploadType
     */
    async upload(localSourcePathFilename: string, uploadType: F5Upload): Promise<HttpResponse> {
        return this._mgmtClient.upload(localSourcePathFilename, uploadType)
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
        return this._mgmtClient.download(fileName, localDestPath, downloadType)
    }






    // /**
    //  * install specified ilx-rpm
    //  *  - need to discuss workflow
    //  *  - should this just install an rpm already uploaded?
    //  *  - or should this also fetch/upload the requested rpm?
    //  */
    // async installRPM(rpmName: string): Promise<HttpResponse> {

    //     return;
    // }



    // /**
    //  * refresh/get latest ATC metadata from 
    //  * *** not implemented yet ***
    //  * https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json
    //  * todo: refresh this file with every packages release via git actions or package.json script
    //  */
    // async refreshMetaData(): Promise<void> {

    //     return;
    // }
}