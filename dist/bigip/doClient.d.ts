import { AtcInfo } from "./bigipModels";
import { atcMetaData } from '../constants';
import { MgmtClient } from "./mgmtClient";
export declare class DoClient {
    mgmtClient: MgmtClient;
    metaData: typeof atcMetaData.do;
    version: AtcInfo;
    constructor(versions: AtcInfo, doMetaData: typeof atcMetaData.do, mgmtClient: MgmtClient);
}
