import { AtcInfo } from "./bigipModels";
import { atcMetaData } from '../constants';
import { MgmtClient } from "./mgmtClient";
export declare class TsClient {
    mgmtClient: MgmtClient;
    metaData: typeof atcMetaData.ts;
    version: AtcInfo;
    constructor(versions: AtcInfo, tsMetaData: typeof atcMetaData.ts, mgmtClient: MgmtClient);
}
