/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */

/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { Method } from "axios";
import { HttpResponse, AtcMetaData, AtcInfo } from "../models";
// import { discoverBigip } from "./discover";
import { MetadataClient } from "./extension/metadata";
import { ManagementClient } from "./mgmtClient";

import localAtcMetadata from './atc_metadata.json';
import { FastClient } from "./fastClient";
import { As3Client } from "./as3Client";
import { DoClient } from "./doClient";
import { TsClient } from "./tsClient";
import { CfClient } from "./cfClient";

export class F5Client {
    protected _mgmtClient: ManagementClient;
    protected _metadataClient: MetadataClient;
    protected _atcMetaData: AtcMetaData = localAtcMetadata;
    host: unknown;
    fast: FastClient | undefined;
    as3: As3Client | undefined;
    do: DoClient | undefined;
    ts: TsClient | undefined;
    cf: CfClient | undefined;

    constructor(
        host: string,
        user: string,
        password: string,
        options?: {
            port?: number;
            provider?: string;
        }
    ) {
        this._mgmtClient = new ManagementClient(
            host,
            user,
            password,
            options ? options : undefined
        )
    }

    /**
     * Make HTTP request
     * 
     * @param uri     request URI
     * @param options function options
     * 
     * @returns request response
     */
    async https(uri: string, options?: {
        method?: Method;
        headers?: any;
        data?: object;
        contentType?: string;
        advancedReturn?: boolean;
    }): Promise<HttpResponse> {
        return await this._mgmtClient.makeRequest(uri, options ? options : undefined)
    }


    /**
     * clear auth token
     *  - mainly for unit tests...
     */
    async clearLogin(): Promise<void> {
        return this._mgmtClient.clearToken();
    }


    /**
     * discover information about device
     *  - bigip/bigiq/nginx?
     *  - tmos/nginx version
     *  - installed atc services and versions
     *  
     */
    async discover(): Promise<void> {
        // try tmos info endpoint
        // try fast info endpoint
        // try as3 info endpoint
        // try do info endpoint
        // try ts info endpoint
        // try cf info endpoint

        await this._mgmtClient.makeRequest('/mgmt/shared/identified-devices/config/device-info')
            .then(resp => this.host = resp.data)

        // check FAST installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.fast.endpoints.info.uri)
            .then(resp => {
                // todo: build fast client class instantiate here
                this.fast = new FastClient(resp.data as AtcInfo, this._atcMetaData.components.fast, this._mgmtClient);
            })


        // check AS3 installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.as3.endpoints.info.uri)
            .then(resp => {
                // if http 2xx, create as3 client
                // notice the recast of resp.data type of "unknown" to "AtcInfo"
                this.as3 = new As3Client(resp.data as AtcInfo, this._atcMetaData.components.as3, this._mgmtClient);
            })
            .catch(err => console.log(err));


        // check DO installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.do.endpoints.info.uri)
            .then(resp => {
                this.do = new DoClient(resp.data[0] as AtcInfo, this._atcMetaData.components.do, this._mgmtClient);
            })
            .catch(err => console.log(err));


        // check TS installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.ts.endpoints.info.uri)
            .then(resp => {
                this.ts = new TsClient(resp.data as AtcInfo, this._atcMetaData.components.ts, this._mgmtClient);
            })
            .catch(err => console.log(err));


        // check CF installed by getting verion info
        await this._mgmtClient.makeRequest(this._atcMetaData.components.cf.endpoints.info.uri)
            .then(resp => {
                this.cf = new CfClient(resp.data as AtcInfo, this._atcMetaData.components.cf, this._mgmtClient);
            })
            .catch(err => console.log(err));


        return;
        // return object of discovered services
    }


    /**
     * upload file to f5
     *  - used for ucs/ilx-rpms/.conf-merges
     * @param localSourcePathFilename 
     */
    async upload(localSourcePathFilename: string) {

        return this._mgmtClient.upload(localSourcePathFilename)

    }


    /**
     * download file from f5 (ucs/qkview/...)
     *  - there are only a couple of directories accessible via api
     *      need to document them and pick a default so the other functions
     *      can put thier output files in the same place
     * @param localDestPathFile 
     */
    async download(fileName: string, localDestPath: string) {
        return this._mgmtClient.download(fileName, localDestPath)
    }



    /**
     * generate and download ucs file
     *  - should include all parameters for creating ucs
     * @param localDestPathFile 
     * @param options.passPhrase to encrypt ucs with
     * @param options.noPrivateKey exclude SSL private keys from regular ucs
     * @param options.mini create mini_ucs for corkscrew
     */
    async getUCS(
        localDestPathFile: string,
        options?: {
            passPhrase?: string;
            noPrivateKey?: boolean;
            mini?: boolean;
        }): Promise<object> {

        // tmsh save sys ucs /var/tmp/backup_${HOSTNAME}_`date +%Y%m%d-%H%M%S`.ucs
        // nice -n 19 qkview -s0
        // K13132: Backing up and restoring BIG-IP configuration files with a UCS archive
        // https://support.f5.com/csp/article/K13132
        // tmsh save sys ucs $(echo $HOSTNAME | cut -d'.' -f1)-$(date +%H%M-%m%d%y)



        return {
            localDestPathFileName: '/path/file.ucs',
            sizeBytes: '1234'
        };
    }




    /**
     * generate and download qkview
     *  - should include all parameters for creating a qkview
     *  - should probably default to silent with lowest priority
     * @param localDestPathFile 
     * @param options 
     */
    async getQkview(
        localDestPathFile: string,
        options?: {
            excludeCoreFiles: boolean;
        }): Promise<unknown> {

        return {
            localDestPathFileName: '/path/file.qkview',
            sizeBytes2: '4567'
        };
    }




    /**
     * install specified ilx-rpm
     *  - need to discuss workflow
     *  - should this just install an rpm already uploaded?
     *  - or should this also fetch/upload the requested rpm?
     */
    async installRPM(rpmName: string) {

        return;
    }



    /**
     * refresh/get latest ATC metadata from 
     * https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json
     * todo: refresh this file with every packages release via git actions or package.json script
     */
    async refreshMetaData() {

        return;
    }
}