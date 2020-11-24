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
import { F5Client } from '../src/bigip/f5Client';
import { 
    as3InfoApiReponse, 
    deviceInfo, 
    doInfoApiReponse, 
    fastInfoApiResponse 
} from './artifacts/f5_device_atc_infos';

import { 
    getF5Client,
    ipv6Host 
} from './fixtureUtils';
// import { requestNew } from '../../src/utils/http_new'
// import { makeRequest } from '../../src/utils/http';
import { getFakeToken } from './fixtureUtils';
import localAtcMetadata from '../src/bigip/atc_metadata.json';
import { AuthTokenReqBody } from '../src/models';






describe('http client tests - ipv6', function () {
    let f5Client: F5Client;

    beforeEach(function () {
        f5Client = getF5Client({ ipv6: true });
    });
    afterEach(function () {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        }
        nock.cleanAll();
    });

    it('should make basic request', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            .get('/foo')
            .reply(200, { foo: 'bar' });

        
        const resp = await f5Client.https('/foo');
        assert.deepStrictEqual(resp.data, { foo: 'bar' })
        await f5Client.clearLogin();
    });

    it('should make basic request - additional mgmt client params', async function () {
        nock(`https://${ipv6Host}:8443`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })

            .get('/foo')
            .reply(200, { foo: 'bar' });

        // create a custom mgmtClient so we can inject/test port/provider
        f5Client = new F5Client(
            ipv6Host,
            'admin',
            'pasdfqwe',
            {
                port: 8443,
                provider: 'tmos'
            }
        )

        const resp = await f5Client.https('/foo');
        assert.deepStrictEqual(resp.data, { foo: 'bar' })
        await f5Client.clearLogin();
    });


    it('extending ipv6 - discovery', async function () {
        nock(`https://${ipv6Host}:8443`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })

            .get('/foo')
            .reply(200, { foo: 'bar' })

            .get('/mgmt/shared/identified-devices/config/device-info')
            .reply(200, deviceInfo)

            .get(localAtcMetadata.components.fast.endpoints.info.uri)
            .reply(200, fastInfoApiResponse)
            
            .get(localAtcMetadata.components.as3.endpoints.info.uri)
            .reply(200, as3InfoApiReponse)

            .get(localAtcMetadata.components.do.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

            .get(localAtcMetadata.components.ts.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

            .get(localAtcMetadata.components.cf.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

        // create a custom mgmtClient so we can inject/test port/provider
        const dClient = new F5Client(
            ipv6Host,
            'admin',
            'admin',
            {
                port: 8443,
                provider: 'tmos'
            }
        )

        const resp = await dClient.https('/foo');

        // like to have some feedback on this function at some point
        // right now it just discovers information
        const disc = await dClient.discover();

        assert.deepStrictEqual(resp.data, { foo: 'bar' })
        await dClient.clearLogin();
    });
});