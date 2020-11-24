
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { TsMetaData, AtcInfo } from "../models";
import { ManagementClient } from "./mgmtClient";

export class TsClient {
    protected _mgmtClient: ManagementClient;
    protected _metaData: TsMetaData;
    protected _version: AtcInfo;
    
    constructor (
        versions: AtcInfo,
        metaData: TsMetaData,
        mgmtClient: ManagementClient
    ) {
        this._version = versions;
        this._metaData = metaData;
        this._mgmtClient = mgmtClient;
    }

    async get () {
        return 'ts-get';
    }

    async post () {
        return 'ts-post';
    }

    async inpsect () {
        return 'ts-inpsect';
    }

    // async remove () {

    //     // if bigiq, target/tenant are needed
    // }
}