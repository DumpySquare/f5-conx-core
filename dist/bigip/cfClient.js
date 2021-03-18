/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CfClient = void 0;
class CfClient {
    constructor(versions, cfMetaData, mgmtClient) {
        this.version = versions;
        this.metaData = cfMetaData;
        this.mgmtClient = mgmtClient;
    }
}
exports.CfClient = CfClient;
//# sourceMappingURL=cfClient.js.map