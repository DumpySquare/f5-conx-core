
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
import * as fs from 'fs';
import path from 'path';


import { F5Client } from '../src/bigip/f5Client';
import { getF5Client, ipv6Host } from './fixtureUtils';
import { getFakeToken } from './fixtureUtils';
import { AuthTokenReqBody } from '../src/bigip/bigipModels';
import { F5DownloadPaths, iControlEndpoints } from '../src/constants';


import { deviceInfo } from './artifacts/f5_device_atc_infos';
import { ucsListApiReponse } from './artifacts/ucsList'
import { HttpResponse } from '../src/utils/httpModels';


let f5Client: F5Client;
let nockScope: nock.Scope;

// test file name
const tmpUcs = 'bigip1_10.200.244.101_20201130T220239571Z.ucs';
// source file with path
const filePath = path.join(__dirname, 'artifacts', tmpUcs)
// tmp directory
const tmpDir = path.join(__dirname, 'tmp')
// destination test path with file name
const tmp = path.join(tmpDir, tmpUcs)

describe('F5Device UCS integration tests - ipv6', function () {

    // runs once before the first test in this block
    before(async function () {
        if (!fs.existsSync(tmpDir)) {
            // console.log('creating temp directory for file upload/download tests')
            fs.mkdirSync(tmpDir);
        }

        nockScope = nock(`https://${ipv6Host}`)
            .post(iControlEndpoints.login)
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            //discover endpoint
            .get(iControlEndpoints.tmosInfo)
            .reply(200, deviceInfo)

        f5Client = getF5Client({ ipv6: true });
        await f5Client.discover();
    });

    // runs once after the last test in this block
    after(function () {
        // if the tmp directory exits, try to delete it
        //  - should be empty, each test should clean up files as needed
        if (fs.existsSync(tmpDir)) {
            try {
                // console.log('deleting temp directory for file upload/download tests')
                fs.rmdirSync(tmpDir);
            } catch (e) {
                console.log('was unable to delete tmp folder for upload/download tests, this typically means there are files in it that one of the tests did not clean up', e)
            }
        }
        f5Client.clearLogin();
    });

    beforeEach(async function () {
        // refresh the device client class

    });

    afterEach(async function () {
        // Alert if all our nocks didn't get used, and clear them out
        // if (!nock.isDone()) {
        //     throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        // }
        // nock.cleanAll();

        // clear token timer if something failed
        // clear auth token for next test
    });

    it('create mini ucs on f5', async function () {
        // nock.recorder.rec();
        let ucsFileName;

        nockScope
            .post(iControlEndpoints.bash)
            .reply((uri, requestBody: { utilCmdArgs: string }) => {
                // capture mini_ucs file name
                ucsFileName = requestBody.utilCmdArgs.match(/ucs\/([\w\.]+)/)[1];
                // provide some generic 200 responsee that the bash command executed
                return [
                    200,
                    {
                        "kind": "tm:util:bash:runstate",
                        "command": "run",
                        "utilCmdArgs": "*** command to make mini_ucs ***",
                        "commandResult": "*** response that means it worked ***"
                    }
                ]
            })
            .post(iControlEndpoints.bash)
            .reply(() => {
                return [
                    200,
                    {
                        "kind": "tm:util:bash:runstate",
                        "command": "run",
                        "utilCmdArgs": "-c 'ls /var/local/ucs'",
                        "commandResult": `${ucsFileName}\ncs_backup_rotate.conf\ntmp\n`
                    }
                ]
            })

        let resp: HttpResponse;
        try {
            resp = await f5Client.ucs.create({ mini: true });
        } catch (e) {
            debugger;
        }

        // assert that the response included an expected file name format
        assert.ok(/\w+.mini_ucs.tar.gz/.test(resp.data.file), 'did not recieve expected file name');
        assert.ok(resp.data.commandResult)

        // assert.deepStrictEqual(resp.data.file, ucsFileName)
        // nock.recorder.play();

    });



    it('generate default UCS on f5', async function () {
        this.slow(6000);
        let ucsFileName;

        nockScope
            .post(iControlEndpoints.backup)
            .reply((uri, requestBody: { file: string }) => {
                ucsFileName = requestBody.file;
                return [
                    202,
                    {
                        "file": ucsFileName,
                        "action": "BACKUP",
                        "id": "091d2db1-8f35-4544-96ee-09f27b0788c3",
                        "status": "STARTED"
                    }
                ]
            })
            .get('/mgmt/tm/shared/sys/backup/091d2db1-8f35-4544-96ee-09f27b0788c3')
            .reply(() => {
                return [
                    200,
                    {
                        "file": ucsFileName,
                        "action": "BACKUP",
                        "id": "091d2db1-8f35-4544-96ee-09f27b0788c3",
                        "status": "STARTED"
                    }
                ]
            })
            .get('/mgmt/tm/shared/sys/backup/091d2db1-8f35-4544-96ee-09f27b0788c3')
            .reply(() => {
                return [
                    200,
                    {
                        "file": ucsFileName,
                        "action": "BACKUP",
                        "id": "091d2db1-8f35-4544-96ee-09f27b0788c3",
                        "status": "FINISHED"
                    }
                ]
            })

        let resp: HttpResponse;
        try {
            resp = await f5Client.ucs.create();
        } catch (e) {
            debugger;
        }

        assert.deepStrictEqual(resp.data.status, 'FINISHED');
        assert.ok(/\w+.ucs/.test(resp.data.file));

    });

    // it('create ucs with passphrase and no-private-keys on f5', async function () {
    //     // todo:  create test for creating ucs with passPhrase and noPrivateKeys
    // });

    // it('create ucs with just passphrase on f5', async function () {
    //     // todo:  create test for creating ucs with passPhrase and noPrivateKeys
    // });

    // it('create ucs with just no-private-keys on f5', async function () {
    //     // todo:  create test for creating ucs with passPhrase and noPrivateKeys
    // });


    it('list ucs on f5', async function () {
        nockScope
            .get(iControlEndpoints.ucs)
            .reply(200, ucsListApiReponse)

        const resp = await f5Client.ucs.list();

        assert.deepStrictEqual(
            resp.data.items[0].apiRawValues.filename,
            '/var/local/ucs/bigip1_10.200.244.101_20201130T223055376Z.ucs'
        )
    });

    it('download ucs from f5', async function () {

        nockScope
            .get(`${F5DownloadPaths.ucs.uri}/${tmpUcs}`)
            .replyWithFile(200, filePath);

        let resp;
        try {
            resp = await f5Client.ucs.download(tmpUcs, tmp);
        } catch (e) {
            debugger;
        }

        // assert that the file exists
        assert.ok(fs.existsSync(resp.data.file));

        // now delete the file
        fs.unlinkSync(resp.data.file);
    });


    it('get UCS (generate and download)', async function () {

        this.slow(6000);
        let ucsFileName;

        nockScope
            .post(iControlEndpoints.backup)
            .reply((uri, requestBody: { file: string }) => {
                ucsFileName = requestBody.file;
                return [
                    202,
                    {
                        "file": ucsFileName,
                        "action": "BACKUP",
                        "id": "091d2db1-8f35-4544-96ee-09f27b0788c3",
                        "status": "STARTED"
                    }
                ]
            })
            .get('/mgmt/tm/shared/sys/backup/091d2db1-8f35-4544-96ee-09f27b0788c3')
            .reply(() => {
                return [
                    200,
                    {
                        "file": ucsFileName,
                        "action": "BACKUP",
                        "id": "091d2db1-8f35-4544-96ee-09f27b0788c3",
                        "status": "STARTED"
                    }
                ]
            })
            .get('/mgmt/tm/shared/sys/backup/091d2db1-8f35-4544-96ee-09f27b0788c3')
            .reply(() => {
                return [
                    200,
                    {
                        "file": ucsFileName,
                        "action": "BACKUP",
                        "id": "091d2db1-8f35-4544-96ee-09f27b0788c3",
                        "status": "FINISHED"
                    }
                ]
            })
            // .persist()
            .get(`${F5DownloadPaths.ucs.uri}/${tmpUcs}`)
            .replyWithFile(200, filePath);

        let resp: HttpResponse;
        try {
            resp = await f5Client.ucs.get({ fileName: tmpUcs, localDestPathFile: tmp });
        } catch (e) {
            debugger;

        }

        // assert that the filePath we got back is what we expect
        assert.deepStrictEqual(resp.data.file, tmp);

        // assert that the response included an expected file name format
        assert.ok(/\w+.ucs/.test(resp.data.file));

        // assert that the file exists
        assert.ok(fs.existsSync(resp.data.file));

        // now delete the file
        fs.unlinkSync(resp.data.file);
    });

});