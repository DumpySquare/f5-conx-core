import { HttpResponse } from "../utils/httpModels";
import { MgmtClient } from "./mgmtClient";
/**
 * handles F5 UCS tasks for generating and downloading UCS files
 *  @param verion is used to adjust api end-points for different versions
 *  @param mgmtclient provides necessary connectivity details
 */
export declare class UcsClient {
    protected _mgmtClient: MgmtClient;
    constructor(mgmtClient: MgmtClient);
    /**
     * generate and download ucs file
     *  - should include all parameters for creating ucs
     * @param options.fileName name of ucs to create (do not include .ucs)
     * @param options.localDestPathFile
     * @param options.passPhrase to encrypt ucs with
     * @param options.noPrivateKey exclude SSL private keys from regular ucs
     * @param options.mini create mini_ucs for corkscrew
     */
    get(options?: {
        fileName?: string;
        localDestPathFile: string;
        passPhrase?: string;
        noPrivateKeys?: boolean;
        mini?: boolean;
    }): Promise<HttpResponse>;
    /**
     *
     * @param localDestPathFile
     * @param options.fileName
     * @param options.passPhrase to encrypt ucs with
     * @param options.noPrivateKey exclude SSL private keys from regular ucs
     * @param options.mini create mini_ucs for corkscrew
     */
    create(options?: {
        fileName?: string;
        passPhrase?: string;
        noPrivateKeys?: boolean;
        mini?: boolean;
    }): Promise<HttpResponse>;
    /**
     * download ucs from f5
     *
     * @param fileName file name of ucs on bigip
     * @param localDestPathFile where to put the file (including file name)
     */
    download(fileName: string, localDestPathFile: string): Promise<HttpResponse>;
    /**
     * list ucs files on f5
     */
    list(): Promise<HttpResponse>;
    /**
     * delete ucs file on f5
     * @param /mgmt/tm/sys/ucs/archive_name
     */
    delete(name: string): Promise<HttpResponse>;
}
