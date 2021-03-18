import { AtcInfo } from "./bigipModels";
import { atcMetaData } from '../constants';
import { MgmtClient } from "./mgmtClient";
export declare class CfClient {
    mgmtClient: MgmtClient;
    metaData: typeof atcMetaData.cf;
    version: AtcInfo;
    constructor(versions: AtcInfo, cfMetaData: typeof atcMetaData.cf, mgmtClient: MgmtClient);
}
