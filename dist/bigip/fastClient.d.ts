import { AtcInfo } from "./bigipModels";
import { atcMetaData } from '../constants';
import { MgmtClient } from "./mgmtClient";
export declare class FastClient {
    mgmtClient: MgmtClient;
    metaData: typeof atcMetaData.fast;
    version: AtcInfo;
    constructor(versions: AtcInfo, fastMetaData: typeof atcMetaData.fast, mgmtClient: MgmtClient);
}
