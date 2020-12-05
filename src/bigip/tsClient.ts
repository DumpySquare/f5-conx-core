/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { TsMetaData, AtcInfo } from "./bigipModels";
import { MgmtClient } from "./mgmtClient";

export class TsClient {
    protected _mgmtClient: MgmtClient;
    protected _metaData: TsMetaData;
    protected _version: AtcInfo;
    
    constructor (
        versions: AtcInfo,
        metaData: TsMetaData,
        mgmtClient: MgmtClient
    ) {
        this._version = versions;
        this._metaData = metaData;
        this._mgmtClient = mgmtClient;
    }

    async get (): Promise<string> {
        return 'ts-get';
    }

    async post (): Promise<string> {
        return 'ts-post';
    }

    async inpsect (): Promise<string> {
        return 'ts-inpsect';
    }

    // async remove () {

    //     // if bigiq, target/tenant are needed
    // }
}