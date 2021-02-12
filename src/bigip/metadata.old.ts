/* eslint-disable @typescript-eslint/ban-types */
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

// import assert from 'assert';
import * as extHttp from '../utils/extHttp';

import localExtensionMetadata from './atc_metadata.old.json';

const EXTENSION_METADATA = {
    url: 'https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json'
};

/**
 * this is the original f5-sdk-js atc meta data client
 */
export class MetadataClient {
    protected _component: string;
    protected _componentVersion: string;
    protected _metadata: unknown;

    /**
     *
     * @param component        component name
     * @param componentVersion component version
     *
     * @returns void
     */
    constructor(component: string, options: {
        componentVersion?: string;
    }) {
        this._metadata = this._loadLocalMetadata();
        this._component = component;
        this._componentVersion = options['componentVersion'] || this.getLatestVersion();
    }

    /**
     * Get component name
     *
     * @returns component name
     */
    getComponentName(): string {
        return this._component;
    }

    /**
     * Get component package name
     *
     * @returns component version
     */
    getComponentPackageName(): string {
        const packageName = this._getComponentVersionMetadata()['packageName'];
        return packageName.match(/.+?(?=-[0-9])/)[0];
    }

    /**
     * Get component version
     *
     * @returns component version
     */
    getComponentVersion(): string {
        return this._componentVersion;
    }

    /**
     * Get component version
     *
     * @returns component version
     */
    getComponentVersionsList(): Array<string> {
        return Object.keys(this._getComponentMetadata()['versions']);
    }

    /**
     * Get configuration endpoint
     *
     * @returns configuration endpoint properties
     */
    getConfigurationEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    } {
        const configure = this._getComponentMetadata()['endpoints']['configure'];
        return {
            endpoint: configure.uri,
            methods: configure.methods
        };
    }

    /**
     * Get download package
     *
     * @returns package download name
     */
    getDownloadPackageName(): string {
        const downloadUrlSplit = this.getDownloadUrl().split('/');
        return downloadUrlSplit[downloadUrlSplit.length - 1];
    }

    /**
     * Get download URL
     *
     * @returns full download URL
     */
    getDownloadUrl(): string {
        return this._getComponentVersionMetadata()['downloadUrl'];
    }

    /**
     * Get info endpoint
     *
     * @returns info endpoint properties
     */
    getInfoEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    } {
        const info = this._getComponentMetadata()['endpoints']['info'];
        return {
            endpoint: info.uri,
            methods: info.methods
        };
    }

    /**
     * Get inspect endpoint
     *
     * @returns info endpoint properties
     */
    getInspectEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    } {
        const info = this._getComponentMetadata()['endpoints']['inspect'];
        return {
            endpoint: info.uri,
            methods: info.methods
        };
    }

    /**
     * Get 'latest' metadata
     *
     * @returns void
     */
    async getLatestMetadata(): Promise<void> {
        const parsedUrl = extHttp.parseUrl(EXTENSION_METADATA.url);
        try {
            const response = await extHttp.makeRequest(parsedUrl.host, parsedUrl.path);
            // this._metadata = response.data;
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Get latest component version
     *
     * @returns get latest component version
     */
    getLatestVersion(): string {
        const componentVersions = this._getComponentMetadata()['versions'];
        const latestVersions = [];

        Object.keys(componentVersions).forEach((version) => {
            if (componentVersions[version].latest) {
                latestVersions.push(version);
            }
        });
        return latestVersions[0] // there should only be one;
    }

    /**
     * Get trigger endpoint
     *
     * @returns info endpoint properties
     */
    getResetEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    } {
        const info = this._getComponentMetadata()['endpoints']['reset'];
        return {
            endpoint: info.uri,
            methods: info.methods
        };
    }

    /**
     * Get trigger endpoint
     *
     * @returns info endpoint properties
     */
    getTriggerEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    } {
        const info = this._getComponentMetadata()['endpoints']['trigger'];
        return {
            endpoint: info.uri,
            methods: info.methods
        };
    }

    protected _loadLocalMetadata(): object {
        return localExtensionMetadata;
    }

    protected _getComponentMetadata(): object {
        return this._metadata['components'][this._component];
    }

    protected _getComponentVersionMetadata(): object {
        return this._getComponentMetadata()['versions'][this._componentVersion];
    }
}

// /////// the following doesn't seem to be used
// /**
//  * Parse URL
//  *
//  * @param url  url
//  *
//  * @returns parsed url properties
//  */
// export function parseUrl(url: string): {
//     host: string;
//     path: string;
// } {
//     // exmple of using the following URL interface for parsing URLs
//     const b = new URL(url);
//     const c = {
//         host: b.host,
//         path: b.pathname
//     }

//     const x = {
//         host: url.split('://')[1].split('/')[0],
//         path: `/${url.split('://')[1].split('/').slice(1).join('/')}`
//     }

//     assert.deepStrictEqual(x, c, 'should be equal');
//     return x;
// }