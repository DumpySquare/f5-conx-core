/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { HttpResponse } from "../utils/httpModels";
import { AtcMetaData } from "./bigipModels";
import { MgmtClient } from "./mgmtClient";
import { ExtHttp } from '../externalHttps';
import { TMP_DIR, AtcGitReleases, iControlEndpoints } from '../constants'


export class AtcMgmtClient {
    public readonly mgmtClient: MgmtClient;
    public readonly metaData: AtcMetaData;
    public readonly extHttp: ExtHttp;


    //#############################################################
    //  ###  the following is just used for reference - metaData should be passed in at instantiation
    // public readonly PKG_MGMT_URI: '/mgmt/shared/iapp/package-management-tasks'
    // public publicMetaData = 'https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json';
    // FAST_GIT_RELEASES = 'https://api.github.com/repos/F5Networks/f5-appsvcs-templates/releases';
    // AS3_GIT_RELEASES = 'https://api.github.com/repos/F5Networks/f5-appsvcs-extension/releases';
    // DO_GIT_RELEASES = 'https://api.github.com/repos/F5Networks/f5-declarative-onboarding/releases';
    // TS_GIT_RELEASES = 'https://api.github.com/repos/F5Networks/f5-telemetry-streaming/releases';

    constructor(

        metaData: AtcMetaData,
        mgmtClient: MgmtClient,
        extHttp: ExtHttp
    ) {
        this.metaData = metaData;
        this.mgmtClient = mgmtClient;
        this.extHttp = extHttp;
    }

    /**
     * functions:
     * 
     * - list available versions
     * - upload/download atc ilx rpm
     * - install/uninstall atc ilx rpm
     *   - list installed packages
     */



    async downloadRpmFromWeb(url: string, filename: string): Promise<HttpResponse> {

        return await this.extHttp.download(url, filename, './f5_cache')

    }


    async uploadRpm(rpm: string): Promise<HttpResponse> {

        return await this.mgmtClient.upload(rpm, 'FILE')

    }


    async install(rpmName: string): Promise<HttpResponse> {

        return await this.mgmtClient.makeRequest(iControlEndpoints.atcPackageMgmt, {
            method: 'POST',
            data: {
                operation: 'INSTALL',
                packageFilePath: `/var/config/rest/downloads/${rpmName}`
            }
        })
            .then(async resp => {
                return await this.mgmtClient.followAsync(`${iControlEndpoints.atcPackageMgmt}/${resp.data.id}`)

            })
    }


    /**
     * shows installed atc ilx rpms on f5
     */
    async showInstalled(): Promise<HttpResponse> {

        return await this.mgmtClient.makeRequest(iControlEndpoints.atcPackageMgmt, {
            method: 'POST',
            data: {
                operation: 'QUERY'
            }
        })
            .then(async resp => {
                return await this.mgmtClient.followAsync(`${iControlEndpoints.atcPackageMgmt}/${resp.data.id}`)
            })
    }


    async unInstall(packageName: string): Promise<HttpResponse> {

        // todo: build async follower to start after job completion and watch for services to be available again

        // https://clouddocs.f5.com/products/iapp/iapp-lx/tmos-13_1/icontrollx_rest_api_appendix/package_management_tasks.html

        // https://support.f5.com/csp/article/K51226856

        return await this.mgmtClient.makeRequest(iControlEndpoints.atcPackageMgmt, {
            method: 'POST',
            data: {
                operation: 'UNINSTALL',
                packageName
            }
        })
            .then(async resp => {
                const job = await this.mgmtClient.followAsync(`${iControlEndpoints.atcPackageMgmt}/${resp.data.id}`)

                // await function to watch restnoded service restart
                //  /mgmt/tm/sys/service/restnoded

                // await this.watchAtcRestart();

                return job;
            })
    }


    async watchAtcRestart(): Promise<HttpResponse> {
        const restnoded = await this.mgmtClient.followAsync('/mgmt/tm/sys/service/restnoded/stats')
        const restjavad = await this.mgmtClient.followAsync('/mgmt/tm/sys/service/restjavad/stats')
        return;
    }

}