
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import assert from 'assert';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { F5UploadPaths, TMP_DIR } from '../src/constants'

import { F5Client } from '../src/bigip/f5Client';
import { getF5Client, ipv6Host } from '../src/utils/testingUtils';
import { getFakeToken } from '../src/utils/testingUtils';
import { AuthTokenReqBody } from '../src/bigip/bigipModels';
import { F5DownloadPaths, iControlEndpoints } from '../src/constants';

import { deviceInfoIPv6 } from './artifacts/f5_device_atc_infos';
import { isObject } from '../src/utils/misc';


let f5Client: F5Client;
let nockScope: nock.Scope;

// test file name
const rpm = 'f5-appsvcs-templates-1.4.0-1.noarch.rpm';
// source file with path
const filePath = path.join(__dirname, 'artifacts', rpm)
// tmp directory
const tmpDir = path.join(__dirname, TMP_DIR)
// destination test path with file name
const tmp = path.join(tmpDir, rpm)

const events = []
let installedRpm;

describe('f5Client rpm mgmt integration tests', function () {

    // runs once before the first test in this block
    before(async function () {

        nockScope = nock(`https://${ipv6Host}`)
            .post(iControlEndpoints.login)
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            //discover endpoint
            .get(iControlEndpoints.tmosInfo)
            .reply(200, deviceInfoIPv6)

        f5Client = getF5Client({ ipv6: true });

        // f5Client = new F5Client('192.168.200.131', 'admin', 'benrocks')

        f5Client.events.on('failedAuth', msg => events.push(msg));
        f5Client.events.on('log-debug', msg => events.push(msg));
        f5Client.events.on('log-info', msg => events.push(msg));
        f5Client.events.on('log-error', msg => events.push(msg));

        await f5Client.discover();

        // nock.recorder.rec();
    });

    // runs once after the last test in this block
    after(function () {
        // clear login at the end of tests
        f5Client.clearLogin();

        // const recording = nock.recorder.play()
        // const x = recording;
    });

    beforeEach(async function () {
        // setting the array length to 0 emptys it, so we can use it as a "const"
        events.length = 0;

    });

    afterEach(async function () {
        // Alert if all our nocks didn't get used, and clear them out
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        }
        // clear any persistent nocks between tests
        nockScope.persist(false)
        
        nock.cleanAll();
    });




    it('upload package', async function () {
        this.slow(1200);

        nockScope
            .persist()
            .post(`${F5UploadPaths.file.uri}/${rpm}`)
            .reply(200, { foo: 'bar' })
            
            await f5Client.atc.uploadRpm(filePath)
            .then(resp => {
                assert.deepStrictEqual(resp.data.fileName, rpm);
                assert.ok(resp.data.bytes);
            })
            .catch(err => {
                debugger;
                return Promise.reject(err);
            })
    });
    
    
    
    it('install package', async function () {
        this.slow('15s');
        
        nockScope
            .persist(false)            
            .post(iControlEndpoints.atcPackageMgmt, {
                operation: 'INSTALL',
                packageFilePath: `/var/config/rest/downloads/${rpm}`
            })
            .reply(202, {
                "id": "63b48c20",
                "status": "CREATED",
            })

            .get(`${iControlEndpoints.atcPackageMgmt}/63b48c20`)
            .reply(200, { status: "STARTED" })

            .get(`${iControlEndpoints.atcPackageMgmt}/63b48c20`)
            .reply(200, { status: 'FINISHED' });

        await f5Client.atc.install(rpm)
            .then(resp => {
                assert.deepStrictEqual(resp.data.status, 'FINISHED');
            })
            .catch(err => {
                debugger;
                return Promise.reject(err);
            })

    });




    it('list installed packages - confirm package INSTALLED', async function () {
        this.slow(15000);

        nockScope
            .post(iControlEndpoints.atcPackageMgmt, {
                operation: 'QUERY',
            })
            .reply(202, { "id": "63b48c20" })

            .get(`${iControlEndpoints.atcPackageMgmt}/63b48c20`)
            .reply(200, { status: "STARTED" })

            .get(`${iControlEndpoints.atcPackageMgmt}/63b48c20`)
            .reply(200, {
                status: 'FINISHED',
                queryResponse: [{
                    packageName: path.parse(rpm).name
                }]
            });


        await f5Client.atc.showInstalled()
            .then(resp => {
                assert.deepStrictEqual(resp.data.status, 'FINISHED');
                // loop through installed packages and return the object matching the rpm installed in previous step
                installedRpm = resp.data.queryResponse.filter((el: { packageName: string }) => {
                    return el.packageName === path.parse(rpm).name
                })[0]
                assert.ok(isObject(installedRpm));
            })
            .catch(err => {
                debugger;
                return Promise.reject(err);
            })
    });


    it('remove installed package', async function () {
        this.slow(15000);

        nockScope
            .post(iControlEndpoints.atcPackageMgmt, {
                operation: 'UNINSTALL',
                packageName: installedRpm.packageName
            })
            .reply(202, {
                "id": "c4b16c2a",
                "status": "CREATED",
            })

            .get(`${iControlEndpoints.atcPackageMgmt}/c4b16c2a`)
            .reply(200, { status: "STARTED" })

            .get(`${iControlEndpoints.atcPackageMgmt}/c4b16c2a`)
            .reply(200, { status: 'FINISHED' });


        await f5Client.atc.unInstall(installedRpm.packageName)
            .then(resp => {
                assert.deepStrictEqual(resp.data.status, 'FINISHED');
            })
            .catch(err => {
                debugger;
                return Promise.reject(err);
            })
    });



    it('list installed packages - confirm package REMOVED', async function () {
        this.slow(15000);

        nockScope
            .post(iControlEndpoints.atcPackageMgmt, {
                operation: 'QUERY',
            })
            .reply(202, { "id": "63b48c20" })

            .get(`${iControlEndpoints.atcPackageMgmt}/63b48c20`)
            .reply(200, { status: "STARTED" })

            .get(`${iControlEndpoints.atcPackageMgmt}/63b48c20`)
            .reply(200, {
                status: 'FINISHED',
                queryResponse: [{
                    packageName: 'some other package'
                }]
            });

        await f5Client.atc.showInstalled()
            .then(resp => {
                // loop through and try to find rpm installed earlier
                installedRpm = resp.data.queryResponse.filter((el: { packageName: string }) => {
                    return el.packageName === path.parse(rpm).name
                })
                assert.deepStrictEqual(resp.data.status, 'FINISHED');
                // rpm we uninstalled, should not be found in the installed list
                assert.deepStrictEqual(installedRpm, []);
            })
            .catch(err => {
                debugger;
                return Promise.reject(err);
            })
    });




});