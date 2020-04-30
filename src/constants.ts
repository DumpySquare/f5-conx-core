/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

export const TMP_DIR = '/tmp';
export const HTTP_STATUS_CODES = {
    ACCEPTED: 202,
    OK: 200
};
export const RETRY = {
    DEFAULT_COUNT: 100,
    DELAY_IN_MS: 1000
};
export const ENV_VARS = {
    LOG_LEVEL: 'F5_SDK_LOG_LEVEL'
};