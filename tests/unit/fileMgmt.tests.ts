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
import { F5Client } from '../../src/bigip/f5Client';
import * as fs from 'fs';


import { getF5Client, ipv6Host } from './bigip/fixtureUtils';
import { getFakeToken } from './bigip/fixtureUtils';
import path from 'path';
import { AuthTokenReqBody } from '../../src/models';



describe('file upload/download tests - ipv6', function () {
    let f5Client: F5Client;


    const rpm = 'f5-appsvcs-templates-1.4.0-1.noarch.rpm';
    const tmp = path.join(__dirname, '..', 'tmp', rpm)
    const filePath = path.join(__dirname, '..', 'artifacts', rpm)

    if (!fs.existsSync(tmp)){
        console.log('creating temp directory for file upload/download tests')
        fs.mkdirSync(tmp);
    }

    beforeEach(function () {
        f5Client = getF5Client({ ipv6: true });
    });
    afterEach(function () {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        }
        nock.cleanAll();
    });

    it('download file from F5', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            .get(`/mgmt/cm/autodeploy/software-image-downloads/${rpm}`)
            .replyWithFile(200, filePath);

        const resp = await f5Client.download(rpm, tmp);     // download file

        assert.ok(fs.existsSync(resp.data.path))                // confirm/assert file is there

        fs.unlinkSync(resp.data.path);                          // remove tmp file
        await f5Client.clearLogin();                            // clear auth token for next test
    });


    it('upload file to ', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            .persist()

            // so the following just tests that the url was POST'd to, not the file contents
            //  but since the function returns the filename and file size, those should confirm
            //  that everthing completed
            .post(`/mgmt/shared/file-transfer/uploads/${rpm}`)
            .reply(200, { foo: 'bar' });

        const response = await f5Client.upload(filePath);
        assert.deepStrictEqual(response.data.fileName, 'f5-appsvcs-templates-1.4.0-1.noarch.rpm')
        assert.ok(response.data.bytes);  // just asserting that we got a value here, should be a number
        await f5Client.clearLogin();
    });

});