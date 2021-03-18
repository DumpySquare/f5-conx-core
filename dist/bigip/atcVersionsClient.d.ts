/// <reference types="node" />
import { AtcVersions } from "./bigipModels";
import { ExtHttp } from '../externalHttps';
import { EventEmitter } from "events";
/**
 * class for managing Automated Tool Chain services versions
 *
 * Uses atc meta data to query each service public repo and get release information
 *
 * @param extHttp client for external connectivity
 * @param logger logger class for logging events within this class
 *
 */
export declare class AtcVersionsClient {
    /**
     * client for handling external HTTP connectivity
     * - also has the cache directory under .cacheDir
     */
    extHttp: ExtHttp;
    /**
     * event emitter instance for this class
     */
    events: EventEmitter;
    /**
     * ATC meta data including api endpoints, github releases url and main repo url
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
            repo: string;
        };
        as3: {
            endPoints: {
                declare: string;
                tasks: string;
                info: string;
            };
            gitReleases: string;
            repo: string;
        };
        do: {
            endPoints: {
                declare: string;
                info: string;
                inspect: string;
            };
            gitReleases: string; /**
             * returns atc version information
             *
             * will only query github to refresh once a day and saves details to file
             */
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
     * base atc version information that comes with the package
     *
     * *updated with every release of f5-conx-core*
     */
    atcVersionsBaseCache: AtcVersions;
    /**
     * date of the last ATC version check
     */
    lastCheckDate: Date | string | undefined;
    /**
     * atc version cache name/location
     *
     * '/home/someUser/f5-conx-core/src/bigip/atcVersions.json'
     */
    atcVersionsFileName: string;
    /**
     *
     */
    cachePath: string;
    /**
     * object containing all the LATEST versions/releases/assets information for each ATC service.
     */
    atcVersions: AtcVersions;
    constructor(options: {
        extHttp?: ExtHttp;
        cachePath?: string;
        eventEmitter?: EventEmitter;
    });
    /**
     * returns atc version information
     *
     * will only query github to refresh once a day and saves details to file
     */
    getAtcReleasesInfo(): Promise<AtcVersions>;
    private loadReleaseInfoFromCache;
    /**
     * save atc release/versions information to cache
     */
    private saveReleaseInfoToCache;
    private refreshAtcReleasesInfo;
}
/**
 * compares semver
 *
 * https://github.com/substack/semver-compare
 *
 * @param a
 * @param b
 */
export declare function cmp(a: string, b: string): 1 | -1 | 0;
