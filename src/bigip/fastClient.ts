
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { FastMetaData, AtcInfo } from "../models";
import { ManagementClient } from "./mgmtClient";


export class FastClient {
    protected _mgmtClient: ManagementClient;
    protected _metaData: FastMetaData;
    protected _version: AtcInfo;
    
    constructor (
        versions: AtcInfo,
        metaData: FastMetaData,
        mgmtClient: ManagementClient
    ) {
        this._version = versions;
        this._metaData = metaData;
        this._mgmtClient = mgmtClient;
    }


    async get () {
        return 'fast-get';
    }

    async post () {
        return 'fast-post';
    }

    async patch () {
        return 'fast-patch';
    }

    async remove () {
        return 'fast-remove';
    }
}