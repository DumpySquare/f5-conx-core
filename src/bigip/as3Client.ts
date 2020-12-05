
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { As3MetaData, AtcInfo } from "./bigipModels";
import { MgmtClient } from "./mgmtClient";


export class As3Client {
    protected _mgmtClient: MgmtClient;
    protected _metaData: As3MetaData;
    protected _version: AtcInfo;

    constructor(
        versions: AtcInfo,
        metaData: As3MetaData,
        mgmtClient: MgmtClient
    ) {
        this._version = versions;
        this._metaData = metaData;
        this._mgmtClient = mgmtClient;
    }


    async get(): Promise<string> {
        return 'as3-get';
    }

    async post(): Promise<string> {
        return 'as3-post';
    }

    async patch(): Promise<string> {
        return 'as3-patch';
    }

    async remove(): Promise<string> {
        return 'as3-remove';
        // if bigiq, target/tenant are needed
    }
}