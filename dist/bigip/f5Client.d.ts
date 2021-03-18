/// <reference types="node" />
import { EventEmitter } from 'events';
import { F5InfoApi, F5DownLoad, F5Upload } from "./bigipModels";
import { HttpResponse, F5HttpRequest, AxiosResponseWithTimings } from "../utils/httpModels";
import { MgmtClient } from "./mgmtClient";
import { UcsClient } from "./ucsClient";
import { QkviewClient } from "./qkviewClient";
import { FastClient } from "./fastClient";
import { As3Client } from "./as3Client";
import { DoClient } from "./doClient";
import { TsClient } from "./tsClient";
import { CfClient } from "./cfClient";
import { AtcMgmtClient } from "./atcMgmtClient";
import { ExtHttp } from '../externalHttps';
/**
 *  Main F5 connectivity client
 *
 * Basic Example:
 *
 * ```
 * const mgmtClient = new f5Client(
 *      host: '192.0.2.1',
 *      user: 'admin',
 *      password: 'admin',
 *      {
 *          port: 8443,
 *          provider: 'tmos'
 *      }
 * );
 * await f5Client.discover();
 * const resp = await f5Client.makeRequest('/mgmt/tm/sys/version');
 * ```
*/
export declare class F5Client {
    /**
     * core f5 mgmt client for making all F5 device calls
     */
    mgmtClient: MgmtClient;
    /**
     * ATC meta data including:
     *  * service endpoint information /info/declare/tasks
     *  * github releases url
     *  * github main repo url
     */
    atcMetaData: {
        fast: {
            endPoints: {
                declare: string;
                templateSets: string;
                templates: string;
                tasks: string;
                info: string;
            };
            gitReleases: string;
            repo: string; /**
             * ### file cache directory
             *
             * This can be set via environment var or set after instantiation
             *
             * default is "/f5_cache"
             */
        };
        as3: {
            endPoints: {
                declare: string;
                tasks: string;
                info: string; /**
                 * F5 Device host information api output from
                 *
                 * '/mgmt/shared/identified-devices/config/device-info'
                 *
                 * Used to understand details of connected device
                 *
                 * Same as mgmtClient class
                 */
            };
            gitReleases: string;
            repo: string;
        };
        do: {
            endPoints: {
                declare: string; /**
                 * atc mgmt class for managing f5 automated toolchain packages
                 */
                info: string;
                inspect: string;
            };
            gitReleases: string;
            repo: string;
        };
        ts: {
            endPoints: {
                declare: string;
                info: string;
            };
            gitReleases: string;
            repo: string;
        };
        cf: {
            endPoints: {
                declare: string;
                info: string;
                inspect: string;
                trigger: string;
                reset: string;
            };
            gitReleases: string;
            repo: string;
        };
    };
    /**
     * ### file cache directory
     *
     * This can be set via environment var or set after instantiation
     *
     * default is "/f5_cache"
     */
    cacheDir: string;
    /**
     * F5 Device host information api output from
     *
     * '/mgmt/shared/identified-devices/config/device-info'
     *
     * Used to understand details of connected device
     *
     * Same as mgmtClient class
     */
    host: F5InfoApi | undefined;
    /**
     * atc mgmt class for managing f5 automated toolchain packages
     */
    atc: AtcMgmtClient;
    /**
     * f5 ucs client for managing create/delete/download operations of UCS files on f5 device
     */
    ucs: UcsClient;
    /**
     * f5 qkview client for managing create/delete/download operations of qkview files on f5 device
     */
    qkview: QkviewClient;
    /**
     * extenal http client used for making calls to everything but the connected device
     *
     * This is used for fetching information from services like github
     */
    extHttp: ExtHttp;
    /**
     * connectivity client for interacting with the FAST service
     */
    fast: FastClient | undefined;
    /**
     * connectivity client for interacting with AS3
     */
    as3: As3Client | undefined;
    /**
     * connectivity client for interacting with DO (declarative onboarding)
     */
    do: DoClient | undefined;
    /**
     * connectivity client for interacting with TS (telemetry streaming)
     */
    ts: TsClient | undefined;
    /**
     * connectivity client for interacting with TS (telemetry streaming)
     */
    cf: CfClient | undefined;
    /**
     * event emitter instance
     */
    events: EventEmitter;
    constructor(host: string, user: string, password: string, hostOptions?: {
        port?: number;
        provider?: string;
    }, eventEmmiter?: EventEmitter, extHttp?: ExtHttp);
    /**
     * clear auth token
     *  - mainly for unit tests...
     */
    clearLogin(): Promise<number>;
    /**
     * Make HTTP request
     *
     * @param uri     request URI
     * @param options function options
     *
     * @returns request response
     */
    https(uri: string, options?: F5HttpRequest): Promise<AxiosResponseWithTimings>;
    /**
     * discover information about device
     *  - bigip/bigiq/nginx?
     *  - tmos/nginx version
     *  - installed atc services and versions
     *
     */
    discover(): Promise<void>;
    /**
     * upload file to f5 -> used for ucs/ilx-rpms/.conf-merges
     *
     * types of F5 uploads
     * - FILE
     *  - uri: '/mgmt/shared/file-transfer/uploads'
     *  - path: '/var/config/rest/downloads'
     * - ISO
     *  - uri: '/mgmt/cm/autodeploy/software-image-uploads'
     *  - path: '/shared/images'
     *
     * @param localSourcePathFilename
     * @param uploadType
     */
    upload(localSourcePathFilename: string, uploadType: F5Upload): Promise<AxiosResponseWithTimings>;
    /**
     * download file from f5 (ucs/qkview/iso)
     * - UCS
     *   - uri: /mgmt/shared/file-transfer/ucs-downloads/${fileName}
     *   - path: /var/local/ucs/${fileName}
     * - QKVIEW
     *   - uri: /mgmt/cm/autodeploy/qkview-downloads/${fileName}
     *   - path: /var/tmp/${fileName}
     * - ISO
     *   - uri: /mgmt/cm/autodeploy/software-image-downloads/${fileName}
     *   - path: /shared/images/${fileName}
     *
     * @param fileName file name on bigip
     * @param localDestPathFile where to put the file (including file name)
     * @param downloadType: type F5DownLoad = "UCS" | "QKVIEW" | "ISO"
     */
    download(fileName: string, localDestPath: string, downloadType: F5DownLoad): Promise<HttpResponse>;
}
