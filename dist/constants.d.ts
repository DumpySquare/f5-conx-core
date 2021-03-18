/**
 * global file cache directory for:
 *  - TMOS IOS (+ signature files)
 *  - ATC ILX RPMs (+ signature files)
 *  - ATC releases information/metadata
 *  - ...
 */
export declare const TMP_DIR = "/f5_cache";
/**
 * url for ATC metadata in the cloud, this is only used by f5-sdk-js and only here for reference
 */
export declare const atcMetaDataCloudUrl = "https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json";
/**
 * Common iControl/tmos api endpoints
 */
export declare const iControlEndpoints: {
    login: string;
    bash: string;
    tmosInfo: string;
    backup: string;
    ucs: string;
    ucsTasks: string;
    sharedUcsBackup: string;
    qkview: string;
    atcPackageMgmt: string;
};
/**
 * NEW atc metadata for endpoints, download and web urls
 */
export declare const atcMetaData: {
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
 * f5 download paths and uri's
 */
export declare const F5DownloadPaths: {
    ucs: {
        uri: string;
        path: string;
    };
    qkview: {
        uri: string;
        path: string;
    };
    iso: {
        uri: string;
        path: string;
    };
};
/**
 * f5 upload paths and uri's
 */
export declare const F5UploadPaths: {
    iso: {
        uri: string;
        path: string;
    };
    file: {
        uri: string;
        path: string;
    };
    ucs: {
        uri: string;
        path: string;
    };
};
