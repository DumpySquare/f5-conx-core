/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
import { AuthTokenReqBody } from '../src/models';


let f5Client: F5Client;

// test file name
const rpm = 'f5-appsvcs-templates-1.4.0-1.noarch.rpm';
// source file with path
const filePath = path.join(__dirname, 'artifacts', rpm)
// tmp directory
const tmpDir = path.join(__dirname, 'tmp')
// destination test path with file name
const tmp = path.join(tmpDir, rpm)

describe('F5Device file upload/download integration tests - ipv6', function () {

    // runs once before the first test in this block
    before(function () {
        if (!fs.existsSync(tmpDir)) {
            // console.log('creating temp directory for file upload/download tests')
            fs.mkdirSync(tmpDir);
        }
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
    });

    beforeEach(function () {
        // refresh the device client class
        f5Client = getF5Client({ ipv6: true });
    });

    afterEach(async function () {
        // Alert if all our nocks didn't get used, and clear them out
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        }
        nock.cleanAll();

        // clear token timer if something failed
        await f5Client.clearLogin();                            // clear auth token for next test
    });



    it('download file from F5', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            .persist()
            .get(`/mgmt/cm/autodeploy/software-image-downloads/${rpm}`)
            .replyWithFile(200, filePath);

        const resp = await f5Client.download(rpm, tmp);    // download file

        assert.ok(fs.existsSync(resp.data.path))           // confirm/assert file is there
        fs.unlinkSync(resp.data.path);                     // remove tmp file
        await f5Client.clearLogin();
    });


    it('upload file to F5', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            // tell the nocks to persist for this test, the following post will get called several times
            //  for all the pieces of the file
            .persist()

            // so the following just tests that the url was POST'd to, not the file contents
            //  but since the function returns the filename and file size as part of the upload process
            //  those should confirm that everthing completed
            .post(`/mgmt/shared/file-transfer/uploads/${rpm}`)
            .reply(200, { foo: 'bar' });

        const response = await f5Client.upload(filePath);
        assert.deepStrictEqual(response.data.fileName, 'f5-appsvcs-templates-1.4.0-1.noarch.rpm')
        assert.ok(response.data.bytes);  // just asserting that we got a value here, should be a number
        await f5Client.clearLogin();
    });
});