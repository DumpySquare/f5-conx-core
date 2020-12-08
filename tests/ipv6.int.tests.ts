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
    fastInfoApiResponse,
    tsInfoApiReponse,
    cfInfoApiReponse 
} from './artifacts/f5_device_atc_infos';

import { 
    getF5Client,
    ipv6Host 
} from './fixtureUtils';
import { getFakeToken } from './fixtureUtils';
import localAtcMetadata from '../src/bigip/atc_metadata.json';
import { AuthTokenReqBody } from '../src/bigip/bigipModels';






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

    // it('connect/discover - not reachable', async function () {
    //     nock(`https://1.1.1.1`)
    //         .post('/mgmt/shared/authn/login')
    //         .reply(200, (uri, reqBody: AuthTokenReqBody) => {
    //             return getFakeToken(reqBody.username, reqBody.loginProviderName);
    //         })

    //         /**
    //          * setup test for device not reachable - network error
    //          * 
    //          * another for IP reachable but f5 info endpoint fails
    //          */

    //     let resp;
    //     try {
    //         resp = await f5Client.discover();

    //     } catch (e) {
    //         debugger;
    //     }
    //     assert.deepStrictEqual(resp.data, { foo: 'bar' })
    //     await f5Client.clearLogin();
    // });

    it('should make basic request', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })
            .get('/foo')
            .reply(200, { foo: 'bar' });

        let resp;
        try {
            resp = await f5Client.https('/foo');

        } catch (e) {
            const log = f5Client.logger.journal
            debugger;
        }
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


    it('extending ipv6 - discovery - nothing installed', async function () {
        nock(`https://${ipv6Host}:8443`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })

            .get('/mgmt/shared/identified-devices/config/device-info')
            .reply(200, deviceInfo)

            .get(localAtcMetadata.components.fast.endpoints.info.uri)
            .reply(404, {
                message: `Public URI path not registered: ${localAtcMetadata.components.fast.endpoints.info.uri}`,
            })
            
            .get(localAtcMetadata.components.as3.endpoints.info.uri)
            .reply(404, {
                message: `Public URI path not registered: ${localAtcMetadata.components.as3.endpoints.info.uri}`,
            })
            
            .get(localAtcMetadata.components.do.endpoints.info.uri)
            .reply(404, {
                message: `Public URI path not registered: ${localAtcMetadata.components.do.endpoints.info.uri}`,
              })

            .get(localAtcMetadata.components.ts.endpoints.info.uri)
            .reply(404, {
                message: `Public URI path not registered: ${localAtcMetadata.components.ts.endpoints.info.uri}`,
              })

            .get(localAtcMetadata.components.cf.endpoints.info.uri)
            .reply(404, {
                message: `Public URI path not registered: ${localAtcMetadata.components.cf.endpoints.info.uri}`,
              })

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

        // const resp = await dClient.https('/foo');

        // like to have some feedback on this function at some point (have it return something)
        // right now it just discovers information
        try {
            await dClient.discover();
        } catch (e) {
            debugger;
        }

        // assert.deepStrictEqual(resp.data, { foo: 'bar' })
        // assert.deepStrictEqual(dClient.fast, undefined);
        assert.deepStrictEqual(dClient.fast, undefined);
        assert.deepStrictEqual(dClient.as3, undefined);
        assert.deepStrictEqual(dClient.do, undefined);
        assert.deepStrictEqual(dClient.ts, undefined);
        assert.deepStrictEqual(dClient.cf, undefined);
        await dClient.clearLogin();
    });



    it('extending ipv6 - discovery', async function () {
        nock(`https://${ipv6Host}:8443`)
            .post('/mgmt/shared/authn/login')
            .reply(200, (uri, reqBody: AuthTokenReqBody) => {
                return getFakeToken(reqBody.username, reqBody.loginProviderName);
            })

            .get('/mgmt/shared/identified-devices/config/device-info')
            .reply(200, deviceInfo)

            .get(localAtcMetadata.components.fast.endpoints.info.uri)
            .reply(200, fastInfoApiResponse)
            
            .get(localAtcMetadata.components.as3.endpoints.info.uri)
            .reply(200, as3InfoApiReponse)

            .get(localAtcMetadata.components.do.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

            .get(localAtcMetadata.components.ts.endpoints.info.uri)
            .reply(200, tsInfoApiReponse)

            .get(localAtcMetadata.components.cf.endpoints.info.uri)
            .reply(200, cfInfoApiReponse)

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

        // const resp = await dClient.https('/foo');

        // like to have some feedback on this function at some point (have it return something)
        // right now it just discovers information
        const disc = await dClient.discover();

        // assert.deepStrictEqual(resp.data, { foo: 'bar' })
        assert.ok(dClient.host)
        assert.ok(dClient.fast)
        assert.ok(dClient.as3)
        assert.ok(dClient.do)
        assert.ok(dClient.ts)
        assert.ok(dClient.cf)
        await dClient.clearLogin();
    });
});