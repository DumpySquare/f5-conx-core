import { AtcInfo } from "./bigipModels";
import { atcMetaData } from '../constants';
import { MgmtClient } from "./mgmtClient";
import { AxiosResponseWithTimings } from "../utils/httpModels";
export declare class CfClient {
    mgmtClient: MgmtClient;
    metaData: typeof atcMetaData.cf;
    version: AtcInfo;
    constructor(versions: AtcInfo, cfMetaData: typeof atcMetaData.cf, mgmtClient: MgmtClient);
    inspect(): Promise<AxiosResponseWithTimings>;
    declare(): Promise<AxiosResponseWithTimings>;
    trigger(): Promise<AxiosResponseWithTimings>;
    reset(): Promise<AxiosResponseWithTimings>;
}
