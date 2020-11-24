
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { As3MetaData, AtcInfo } from "../models";
import { ManagementClient } from "./mgmtClient";


export class As3Client {
    protected _mgmtClient: ManagementClient;
    protected _metaData: As3MetaData;
    protected _version: AtcInfo;
    
    constructor (
        versions: AtcInfo,
        metaData: As3MetaData,
        mgmtClient: ManagementClient
    ) {
        this._version = versions;
        this._metaData = metaData;
        this._mgmtClient = mgmtClient;
    }


    async get () {
        return 'as3-get';
    }

    async post () {
        return 'as3-post';
    }

    async patch () {
        return 'as3-patch';
    }

    async remove () {
        return 'as3-remove';
        // if bigiq, target/tenant are needed
    }
}