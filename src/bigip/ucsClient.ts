/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';


import { ManagementClient } from "./mgmtClient";

/**
 * handles F5 UCS tasks for generating and downloading UCS files
 */
export class UcsClient {
    protected _mgmtClient: ManagementClient;
    
    /**
     * placeholder to track tmos version if we need to adjust methods depending on version
     */
    protected _tmosVersion: string;

    /**
     * the tasks path url seems to be the original async method
     */
    protected _taskUcsUrl = '/mgmt/tm/task/sys/ucs'
    /**
     * the shared path url seems to be the latest method
     *  - also supports "no-private-keys" option
     */
    protected _sharedUcsUrl = '/mgmt/tm/shared/sys/backup'

    constructor (
        version: string,
        mgmtClient: ManagementClient
    ) {
        this._version = version;
        this._mgmtClient = mgmtClient;
    }
    // tmsh save sys ucs /var/tmp/backup_${HOSTNAME}_`date +%Y%m%d-%H%M%S`.ucs
    // K13132: Backing up and restoring BIG-IP configuration files with a UCS archive
    // https://support.f5.com/csp/article/K13132
    // tmsh save sys ucs $(echo $HOSTNAME | cut -d'.' -f1)-$(date +%H%M-%m%d%y)
    //  https://github.com/F5Networks/f5-ansible/blob/devel/ansible_collections/f5networks/f5_modules/plugins/modules/bigip_ucs_fetch.py

    // /mgmt/tm/sys/ucs/1606307886548143

    // /mgmt/tm/shared/sys/backup/example
    // /mgmt/tm/shared/sys/backup/a5e23ab2-cfc3-4f69-966e-30aeb237b5a8



    /**
     * generate and download ucs file
     *  - should include all parameters for creating ucs
     * @param localDestPathFile 
     * @param options.passPhrase to encrypt ucs with
     * @param options.noPrivateKey exclude SSL private keys from regular ucs
     * @param options.mini create mini_ucs for corkscrew
     */
    async get(
        localDestPathFile: string,
        options?: {
            passPhrase?: string;
            noPrivateKeys?: boolean;
            mini?: boolean;
        }): Promise<any> {

        const x = localDestPathFile + options;
        
        if(options?.mini) {

            // bash call to create mini_ucs
            const tempFile = `mini_ucs.tar.gz`;
        
            // build mini ucs
            const ucsCmd = 'tar -czf /shared/images/${tempFile} /config/bigip.conf /config/bigip_base.conf /config/partitions';

            const makeMini = await this._mgmtClient.makeRequest(`/mgmt/tm/util/bash`, {
                method: 'POST',
                body: {
                    command: 'run',
                    utilCmdArgs: `-c '${ucsCmd}'`
                }
            });

            // then download
            const             
            // can we add the ability to passphrase the archive?


        } else {
            // build api call depending on options
            
            const postBody = {}

            if(options?.passPhrase && options?.noPrivateKeys) {

                postBody.action = 'BACKUP_WITH_NO_PRIVATE_KEYS_WITH_ENCRYPTION';
                postBody.file = 'testnnn.ucs';
                postBody.passphrase = options.passPhrase;

            } else if (options?.passPhrase) {
                
                postBody.action = 'BACKUP_WITH_ENCRYPTION';
                postBody.file = 'testnnn.ucs';
                postBody.passphrase = options.passPhrase;

            } else if (options?.noPrivateKeys) {
                
                postBody.action = 'BACKUP_WITH_NO_PRIVATE_KEYS';
                postBody.file = 'testnnn.ucs';

            }

            // create ucs
            const createUcs = await this._mgmtClient.makeRequest(_sharedUcsUrl, {
                method: 'POST',
                data: postBody
            })

            // download ucs
            const downloadedUcs = await this._mgmtClient.download()
        }

        return {
            localDestPathFileName: '/path/file.ucs',
            sizeBytes: '1234'
        };
    }


    async list(): Promise<void> {
        //
    }
}


/**
 * example output from /mgmt/tm/shared/sys/backup/example
 */
const example = {
    "items": [
        {
            "file": "example string",
            "passphrase": "example string",
            "action": "BACKUP",
            "id": "88f02992-a8fd-40e8-a018-37f2e21f9361",
            "status": "CREATED",
            "startTime": "2020-11-26T03:58:01.389-0800",
            "endTime": "2020-11-26T03:58:01.389-0800",
            "name": "example string",
            "description": "example string",
            "errorMessage": "example string",
            "progress": "example string",
            "numericProgress": 1.7976931348623157e+308,
            "taskWorkerReference": {
                "link": "http://host:port/path/to/resource",
                "isSubcollection": false
            },
            "userReference": {
                "link": "http://host:port/path/to/resource",
                "isSubcollection": false
            },
            "identityReferences": [
                {
                    "link": "http://host:port/path/to/resource",
                    "isSubcollection": false
                },
                {
                    "link": "http://host:port/path/to/resource",
                    "isSubcollection": false
                }
            ],
            "ownerMachineId": "88f02992-a8fd-40e8-a018-37f2e21f9361",
            "taskWorkerGeneration": 9223372036854776000,
            "validateOnly": false,
            "generation": 9223372036854776000,
            "lastUpdateMicros": 9223372036854776000,
            "expirationMicros": 9223372036854776000,
            "kind": "tm:shared:sys:backup:ucsbackuptaskitemstate",
            "selfLink": "https://localhost/mgmt/tm/shared/sys/backup/example/item",
            "actionEnumValues": [
                "BACKUP",
                "RESTORE",
                "RESTORE_WITH_NO_LICENSE",
                "BACKUP_WITH_NO_PRIVATE_KEYS",
                "BACKUP_WITH_ENCRYPTION",
                "BACKUP_WITH_NO_PRIVATE_KEYS_WITH_ENCRYPTION",
                "RESTORE_WITH_ENCRYPTION",
                "RESTORE_WITH_NO_LICENSE_WITH_ENCRYPTION",
                "CLEANUP"
            ],
            "statusEnumValues": [
                "CREATED",
                "STARTED",
                "CANCEL_REQUESTED",
                "CANCELED",
                "FAILED",
                "FINISHED"
            ]
        }
    ],
    "description": {
        "propertyDocumentationComments": {},
        "fieldTypeMap": {},
        "indexStorageMap": {},
        "indexAllContentExclusionMap": [
            "id"
        ],
        "primaryKeyPropertyName": "id",
        "naturalKeyPropertyNames": [],
        "expandAllWithKeysPropertyNames": [],
        "generation": 0,
        "lastUpdateMicros": 0
    },
    "generation": 0,
    "lastUpdateMicros": 0,
    "kind": "tm:shared:sys:backup:ucsbackuptaskcollectionstate",
    "selfLink": "https://localhost/mgmt/tm/shared/sys/backup/example"
}