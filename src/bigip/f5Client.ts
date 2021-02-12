
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { EventEmitter } from 'events';

import { AtcInfo, F5InfoApi, F5DownLoad, F5Upload } from "./bigipModels";
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
import { AtcMgmtClient } from "./atcMgmtClient";

import localAtcMetadataSdk from './atc_metadata.old.json';
import { ExtHttp } from '../externalHttps';
import { TMP_DIR, atcMetaDataCloudUrl, atcMetaData as atcMetaDataNew } from '../constants'
import path from 'path';


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
    protected mgmtClient: MgmtClient;
    // protected _metadataClient: MetadataClient;
    atcMetaDataSdk = localAtcMetadataSdk;
    atcMetaData = atcMetaDataNew;
    cacheDir: string;
    host: F5InfoApi | undefined;
    atc: AtcMgmtClient;
    ucs: UcsClient;
    qkview: QkviewClient;
    extHttp: ExtHttp;
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
        hostOptions?: {
            port?: number,
            provider?: string,
        },
        extHttp?: ExtHttp
    ) {
        this.mgmtClient = new MgmtClient(
            host,
            user,
            password,
            hostOptions
        )

        this.cacheDir = process.env.F5_CONX_CORE_CACHE || path.join(process.cwd(), TMP_DIR);

        // get event emitter instance from mgmtClient
        this.events = this.mgmtClient.getEvenEmitter();

        // setup external http class (feed it the events instance)
        this.extHttp = extHttp ? extHttp : new ExtHttp({ 
            eventEmitter: this.events,
        });

        // setup ucsClient
        this.ucs = new UcsClient(this.mgmtClient)

        // setup qkviewClient
        this.qkview = new QkviewClient(this.mgmtClient)

        // setup atc rpm ilx mgmt
        this.atc = new AtcMgmtClient(this.mgmtClient, this.extHttp)
        
    }


    
    /**
     * clear auth token
     *  - mainly for unit tests...
     */
    async clearLogin(): Promise<number> {
        return this.mgmtClient.clearToken();
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
        return await this.mgmtClient.makeRequest(uri, options)
    }


    /**
     * discover information about device
     *  - bigip/bigiq/nginx?
     *  - tmos/nginx version
     *  - installed atc services and versions
     *  
     */
    async discover(): Promise<void> {

        // // refresh atc meta data
        // this.refreshMetaData()
        // .then( resp => {
        //     this.events.emit('log-info', 'Refreshing atc metadata from cloud')
        //     this.atcMetaData = resp.data;
        // })
        // .catch( err => {
        //     this.events.emit('log-info', {
        //         msg: 'was NOT able to access internet to get latest atc metadata',
        //         err
        //     })
        // })

        // get device info
        await this.mgmtClient.makeRequest('/mgmt/shared/identified-devices/config/device-info')
            .then(resp => {

                // assign details to this and mgmtClient class
                this.host = resp.data
                this.mgmtClient.hostInfo = resp.data
            })


        // check FAST installed by getting verion info
        await this.mgmtClient.makeRequest(this.atcMetaDataSdk.components.fast.endpoints.info.uri)
            .then(resp => {
                this.fast = new FastClient(resp.data as AtcInfo, this.atcMetaDataSdk.components.fast, this.mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })

        // check AS3 installed by getting verion info
        await this.mgmtClient.makeRequest(this.atcMetaDataSdk.components.as3.endpoints.info.uri)
            .then(resp => {
                // if http 2xx, create as3 client
                // notice the recast of resp.data type of "unknown" to "AtcInfo"
                this.as3 = new As3Client(resp.data as AtcInfo, this.mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        // check DO installed by getting verion info
        await this.mgmtClient.makeRequest(this.atcMetaDataSdk.components.do.endpoints.info.uri)
            .then(resp => {
                this.do = new DoClient(resp.data[0] as AtcInfo, this.atcMetaDataSdk.components.do, this.mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        // check TS installed by getting verion info
        await this.mgmtClient.makeRequest(this.atcMetaDataSdk.components.ts.endpoints.info.uri)
            .then(resp => {
                this.ts = new TsClient(resp.data as AtcInfo, this.atcMetaDataSdk.components.ts, this.mgmtClient);
            })
            .catch(() => {
                // do nothing... but catch the error from bubbling up and causing other issues
                // this.logger.debug(err);
            })


        // check CF installed by getting verion info
        await this.mgmtClient.makeRequest(this.atcMetaDataSdk.components.cf.endpoints.info.uri)
            .then(resp => {
                this.cf = new CfClient(resp.data as AtcInfo, this.atcMetaDataSdk.components.cf, this.mgmtClient);
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
        return this.mgmtClient.upload(localSourcePathFilename, uploadType)
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
        return this.mgmtClient.download(fileName, localDestPath, downloadType)
    }









    /**
     * refresh/get latest ATC metadata from cloud
     * 
     * https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json
     * todo: refresh this file with every packages release via git actions or package.json script
     */
    async refreshMetaData(): Promise<HttpResponse> {
        return await this.extHttp.makeRequest({ url: atcMetaDataCloudUrl })
    }
}