/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import path from "path";
import fs from 'fs';

// import { HttpResponse } from "../utils/httpModels";
import { Asset, AtcRelease, AtcVersion, AtcVersions, GitRelease } from "./bigipModels";
import { ExtHttp } from '../externalHttps';
import { atcMetaData } from '../constants'
import Logger from "../logger";
import axios from "axios";


/**
 * class for managing Automated Tool Chain services
 *  - install/unInstall
 *  - including download from web and upload to f5
 *  - will cache files locally to minimize downloads
 *  - installed services and available versions should be handled at the f5Client level (through discover function and metadata client)
 * 
 * @param extHttp client for external connectivity
 * 
 */
export class AtcVersionsClient {
    /**
     * client for handling external HTTP connectivity
     * - also has the cache directory under .cacheDir
     */
    extHttp: ExtHttp;

    logger: Logger;

    atcMetaData = atcMetaData;
    // checkDate;
    atcMetaDataFileName = 'atcMetaData.json'
    atcVersions: AtcVersions = {}

    constructor(
        extHttp: ExtHttp,
        logger: Logger
    ) {
        this.extHttp = extHttp;
        this.logger = logger;
    }

    async getAtcReleasesInfo(): Promise<AtcVersions> {
        // load info from cache
        await this.loadReleaseInfoFromCache();

        // if atcVersions has information and atcVersions.lastCheckDate is same day
        // return this.atcVersions
        // else
        // this.refreshAtcReleaseInfo, then return it

        const checkDate = this.atcVersions?.lastCheckDate?.getDate();
        const todayDate = new Date().getDate();

        if (checkDate === todayDate) {
            // was already checked/refreshed today, so pass info we already got
            return this.atcVersions;
            // return;
        } else {
            // has not been checked today
            return await this.refreshAtcReleasesInfo();
        }

    }


    async loadReleaseInfoFromCache(): Promise<any> {
        // load release information from file
        const filePath = path.join(this.extHttp.cacheDir, this.atcMetaDataFileName)

        // check tmp_dir for file
        try {
            // load file, json.parse?
            const versionFile = fs.readFileSync(filePath).toString();
            this.atcVersions = JSON.parse(versionFile);
        } catch (e) {
            this.logger.error('no atc release version metadata found at', filePath);
        }
    }

    async saveReleaseInfoToCache(): Promise<any> {
        // save atc release information to cache

        const filePath = path.join(this.extHttp.cacheDir, this.atcMetaDataFileName)

        try {
            const saveedd = fs.writeFileSync(
                path.join(this.extHttp.cacheDir, this.atcMetaDataFileName),
                JSON.stringify(this.atcVersions, undefined, 4)
            );
        } catch (e) {
            this.logger.error('not able to save atc versions info to ', filePath, e);
        }
    }

    /*
     * loads all the release information for each ATC service
     * - this should be async to complete in the background once a day
     */
    async refreshAtcReleasesInfo(): Promise<AtcVersions> {

        const atcTypes = Object.keys(this.atcMetaData);
        atcTypes.forEach(async atc => {

            // at launch of extension, load all the latest atc metadata
            const y = this.atcMetaData[atc].gitReleases;
            await this.extHttp.makeRequest({ url: this.atcMetaData[atc].gitReleases })
                .then(async resp => {
                    // loop through reach release and build 
                    const latest: string[] = [];
                    const releases = await resp.data.map(async (el: GitRelease) => {

                        // get filter/map out only the details we want for each asset
                        const assets = await el.assets.map(async (asset: Asset) => {
                            return {
                                name: asset.name,
                                id: asset.id,
                                size: asset.size,
                                browser_download_url: asset.browser_download_url
                            };
                        });

                        // remove the leadin "v" from the version number
                        // const version = el.tag_name.replace(/v/, '');
                        const version = el.tag_name;

                        await latest.push(version);
                        return {
                            version,
                            id: el.id,
                            assets
                        };
                    });


                    this.atcVersions[atc] = {
                        releases,
                        latest: latest.sort(cmp)[latest.length - 1]
                    };


                }).catch(err => {
                    debugger;
                });


        });

        this.atcVersions.lastCheckDate = new Date();
        const now = new Date();
        const nowDate = now.getDate();
        const yesterday = now.getDate() - 1;

        const ret = '';
        
        this.saveReleaseInfoToCache();
        return this.atcVersions;
    }

}




/**
 * compares semver
 * 
 * https://github.com/substack/semver-compare
 * 
 * @param a 
 * @param b 
 */
export function cmp(a: string, b: string): 1 | -1 | 0 {
    // refactor this into ternary operators

    // remove leading "v" if found, then split on "."
    const pa = a.replace(/v/, '').split('.');
    const pb = b.replace(/v/, '').split('.');
    for (let i = 0; i < 3; i++) {
        const na = Number(pa[i]);
        const nb = Number(pb[i]);
        if (na > nb) { return 1; }
        if (nb > na) { return -1; }
        if (!isNaN(na) && isNaN(nb)) { return 1; }
        if (isNaN(na) && !isNaN(nb)) { return -1; }
    }
    return 0;
}