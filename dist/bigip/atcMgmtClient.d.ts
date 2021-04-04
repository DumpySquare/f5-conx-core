import { HttpResponse } from "../utils/httpModels";
import { MgmtClient } from "./mgmtClient";
import { ExtHttp } from '../externalHttps';
/**
 * class for managing Automated Tool Chain services
 *  - install/unInstall
 *  - including download from web and upload to f5)
 *  - will cache files locally to minimize downloads)
 *  - installed services and available versions should be handled at the f5Client level (through discover function and metadata client)
 *
 * @param mgmtClient connected device mgmt client
 * @param extHttp client for external connectivity
 *
 */
export declare class AtcMgmtClient {
    readonly mgmtClient: MgmtClient;
    readonly extHttp: ExtHttp;
    isBigiq: boolean;
    constructor(mgmtClient: MgmtClient, extHttp: ExtHttp);
    private morphBigiq;
    /**
     * download file from external web location
     * - should be rpm files and rsa signatures
     *
     * @param url ex.
     * `https://github.com/F5Networks/f5-appsvcs-templates/releases/download/v1.4.0/f5-appsvcs-templates-1.4.0-1.noarch.rpm`
     */
    download(url: string): Promise<HttpResponse | {
        data: {
            file: string;
            bytes: number;
        };
    }>;
    /**
     * upload rpm to f5
     * FILE
     *  - uri: '/mgmt/shared/file-transfer/uploads'
     *  - path: '/var/config/rest/downloads'
     * @param rpm `full local path + file name`
     */
    uploadRpm(rpm: string): Promise<HttpResponse>;
    /**
     * install rpm on F5 (must be uploaded first)
     * @param rpmName
     */
    install(rpmName: string): Promise<HttpResponse>;
    /**
     * shows installed atc ilx rpms on f5
     */
    showInstalled(): Promise<HttpResponse>;
    /**
     * uninstall atc/ilx/rpm package on f5
     * @param packageName
     * ex. 'f5-appsvcs-templates-1.4.0-1.noarch'
     */
    unInstall(packageName: string): Promise<HttpResponse>;
    /**
     * after the rpm install/unInstall job completes (which happens in seconds), the restnoded/restjavad services need to restart, which can take 20-30 seconds before the service is available for use
     *
     * Having this function would allow that restart to be monitored so the UI can be refreshed and the service can start being used
     *
     * to be called at the end of most of the functions above
     */
    watchAtcRestart(): Promise<unknown>;
}
