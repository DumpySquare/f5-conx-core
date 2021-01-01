/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

export const TMP_DIR = '/f5_cache';


/**
 * Common iControl/tmos api endpoints
 */
export const iControlEndpoints = {
    login: '/mgmt/shared/authn/login',
    bash: '/mgmt/tm/util/bash',
    tmosInfo: '/mgmt/shared/identified-devices/config/device-info',
    backup: '/mgmt/tm/shared/sys/backup',
    ucs: '/mgmt/tm/sys/ucs',
    ucsTasks: '/mgmt/tm/task/sys/ucs',
    sharedUcsBackup: '/mgmt/tm/shared/sys/backup',
    qkview: '/mgmt/cm/autodeploy/qkview'
}

/**
 * f5 download paths and uri's
 */
export const F5DownloadPaths = {
    ucs: {
        uri: '/mgmt/shared/file-transfer/ucs-downloads',
        path: '/var/local/ucs/'
    },
    qkview: {
        uri: '/mgmt/cm/autodeploy/qkview-downloads',
        path: '/var/tmp/'
    },
    iso: {
        uri: '/mgmt/cm/autodeploy/software-image-downloads',
        path: '/shared/images/'
    }
};


/**
 * f5 upload paths and uri's
 */
export const F5UploadPaths = {
    iso: {
        uri: '/mgmt/cm/autodeploy/software-image-uploads',
        path: '/shared/images'
    },
    file: {
        uri: '/mgmt/shared/file-transfer/uploads',
        path: '/var/config/rest/downloads'
    }
}