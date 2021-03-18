import { HttpResponse } from "../utils/httpModels";
import { As3Dec, AtcInfo } from "./bigipModels";
import { MgmtClient } from "./mgmtClient";
import { atcMetaData } from '../constants';
/**
 * AS3 client class that handles AS3 calls
 */
export declare class As3Client {
    readonly mgmtClient: MgmtClient;
    metaData: typeof atcMetaData.as3;
    /**
     * AS3 service version information
     */
    readonly version: AtcInfo;
    /**
     * declarations of targets (typically from bigiq)
     */
    readonly targets: {
        label: string;
        declaration: unknown;
        target: string;
        id: string;
        schemaVersion: string;
        updateMode: string;
    }[];
    /**
     * list of tenants/declarations
     */
    readonly tenants: {
        class: string;
        schemaVersion: string;
        updateMode: string;
        [key: string]: unknown;
    }[];
    constructor(versions: AtcInfo, as3MetaData: typeof atcMetaData.as3, mgmtClient: MgmtClient);
    /**
     * get as3 tasks
     * @param task ID to get
     * if no task, returns all
     */
    getTasks(id?: string): Promise<HttpResponse>;
    /**
     * get AS3 declaration(s)
     *
     * ** extended/full are pretty much the same **
     *
     * @param options.expanded get extended/full declartion (includes default tmos settings)
     */
    getDecs(options?: {
        expanded?: boolean;
        tenant?: string;
    }): Promise<HttpResponse>;
    /**
     * Post AS3 delcaration
     * ** async by default **
     * @param data delaration to post
     */
    postDec(data: unknown): Promise<HttpResponse>;
    /**
     * Remove AS3 tenant - works with both bigip and bigiq
     *
     * ** target parameter is optional!!! **
     *
     * ```json
     * {
     *      "class": "AS3",
     *      "declaration": {
     *          "class": "ADC",
     *          "schemaVersion": "3.0.0",
     *          "target": "192.168.200.13",
     *          "tenant1": {
     *              "class": "Tenant"
     *          }
     *      }
     * }
     * ```
     *
     * @param tenant tenant to delete
     * @param dec empty declaration to remove from multi-target system
     */
    deleteTenant(x: As3Dec | string): Promise<HttpResponse>;
    /**
     * parse as3 declare responses into target/tenant/declaration lists.
     * This data can be used to repost declarations from multi-target/tenant responses.
     * This was inspired by what is needed for the extension to list and repost decs in the view
     * - todo: provide better typing for this entire function 'any'=bad
     * @param x delcare endpoint response
     */
    parseDecs(x: any): Promise<any[]>;
}
