
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { FastMetaData, AtcInfo } from "./bigipModels";
import { MgmtClient } from "./mgmtClient";


export class FastClient {
    mgmtClient: MgmtClient;
    metaData: FastMetaData;
    version: AtcInfo;

    constructor(
        versions: AtcInfo,
        metaData: FastMetaData,
        mgmtClient: MgmtClient
    ) {
        this.version = versions;
        this.metaData = metaData;
        this.mgmtClient = mgmtClient;
    }


    // async get(): Promise<string> {
    //     return 'fast-get';
    // }

    // async post(): Promise<string> {
    //     return 'fast-post';
    // }

    // async patch(): Promise<string> {
    //     return 'fast-patch';
    // }

    // async remove(): Promise<string> {
    //     return 'fast-remove';
    // }
}