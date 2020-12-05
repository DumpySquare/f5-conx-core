
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { CfMetaData, AtcInfo } from "./bigipModels";
import { MgmtClient } from "./mgmtClient";


export class CfClient {
    protected _mgmtClient: MgmtClient;
    protected _metaData: CfMetaData;
    protected _version: AtcInfo;

    constructor(
        versions: AtcInfo,
        metaData: CfMetaData,
        mgmtClient: MgmtClient
    ) {
        this._version = versions;
        this._metaData = metaData;
        this._mgmtClient = mgmtClient;
    }


    async get(): Promise<string> {
        return 'cf-get';
    }

    async post(): Promise<string> {
        return 'cf-post';
    }

    async patch(): Promise<string> {
        return 'cf-patch';
    }

    async remove(): Promise<string> {
        return 'cf-remove';
    }
}