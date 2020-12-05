
/**
 * F5 TMOS token framework 
 */
export type Token = {
    token: string;
    timeout: number;
    userName: string;
    authProviderName: string;
}

/**
 * body for getting token at '/mgmt/shared/authn/login'
 */
export type AuthTokenReqBody = {
    username: string,
    password: string,
    loginProviderName: string
}


/**
 * types of F5 file download locations
 * - UCS
 *   - uri: /mgmt/shared/file-transfer/ucs-downloads/${fileName}
 *   - path: /var/local/ucs/${fileName}
 * - QKVIEW
 *   - uri: /mgmt/cm/autodeploy/qkview-downloads/${fileName}
 *   - path: /var/tmp/${fileName}
 * - ISO
 *   - uri: /mgmt/cm/autodeploy/software-image-downloads/${fileName}
 *   - path: /shared/images/${fileName}
 * 
 * 
 * K04396542: Generating a QKView diagnostic file using the iControl REST API
 *  - https://support.f5.com/csp/article/K04396542
 */
export type F5DownLoad = 'UCS' | 'QKVIEW' | 'ISO'

export type F5Upload = 'ISO' | 'FILE'



// // https://nodejs.org/docs/latest-v12.x/api/http.html#http_http_request_url_options_callback

// // outgoing headers allows numbers (as they are converted internally to strings)
// export type OutgoingHttpHeaders = {
//     [header: string]: number | string | string[] | undefined ;
// }






export type AtcInfo = {
    version: string,
    release: string,
    schemaCurrent: string,
    schemaMinimum: string
}

/**
 * ATC metadata model
 * this data has a local cache but also updated from here:
 * https://cdn.f5.com/product/cloudsolutions/f5-extension-metadata/latest/metadata.json
 */
export type AtcMetaData = {
    components: {
        fast: FastMetaData,  
        do: DoMetaData,
        as3: As3MetaData,
        ts: TsMetaData,
        cf: CfMetaData
    }
}



export type FastMetaData = {
    endpoints: {
        info: {
            uri: string,
            methods: string[]
        }
    },
    versions: {
        [key: string]: {
            downloadUrl: string,
            packageName: string,
            latest: boolean
        }
    },
    componentDependencies: unknown;
};

export type DoMetaData = {
    endpoints: {
        configure: {
            uri: string,
            methods: string[]
        },
        info: {
            uri: string,
            methods: string[]
        },
        inspect: {
            uri: string,
            methods: string[]
        }
    },
    versions: {
        [key: string]: {
            downloadUrl: string,
            packageName: string,
            latest: boolean
        }
    },
    componentDependencies: unknown;
};

export type As3MetaData = {
    endpoints: {
        configure: {
            uri: string,
            methods: string[]
        },
        info: {
            uri: string,
            methods: string[]
        }
    },
    versions: {
        [key: string]: {
            downloadUrl: string,
            packageName: string,
            latest: boolean
        }
    },
    componentDependencies: unknown;
};


export type TsMetaData = {
    endpoints: {
        configure: {
            uri: string,
            methods: string[]
        },
        info: {
            uri: string,
            methods: string[]
        }
    },
    versions: {
        [key: string]: {
            downloadUrl: string,
            packageName: string,
            latest: boolean
        }
    },
    componentDependencies: unknown;
};


export type CfMetaData = {
    endpoints: {
        configure: {
            uri: string,
            methods: string[]
        },
        info: {
            uri: string,
            methods: string[]
        }
        inspect: {
            uri: string,
            methods: string[]
        }
        trigger: {
            uri: string,
            methods: string[]
        }
        reset: {
            uri: string,
            methods: string[]
        }
    },
    versions: {
        [key: string]: {
            downloadUrl: string,
            packageName: string,
            latest: boolean
        }
    },
    componentDependencies: unknown;
};




export type F5InfoApi = {
    baseMac: string;
    hostMac: string;
    halUuid: string;
    chassisSerialNumber: string;
    slots: {
        volume: string;
        product: string;
        version: string;
        build: string;
        isActive: boolean;
    }[];
    license: {
        licenseEndDateTime: string;
        registrationKey: string;
        activeModules: string[];
        generation: number;
        lastUpdateMicros: number;
    };
    interfaces: string[];
    isIControlRestSupported: boolean;
    icrdPort: number;
    time: number;
    physicalMemory: number;
    platform: string;
    cpu: string;
    machineId: string;
    address: string;
    hostname: string;
    version: string;
    product: string;
    platformMarketingName: string;
    edition: string;
    build: string;
    restFrameworkVersion: string;
    managementAddress: string;
    mcpDeviceName: string;
    isClustered: boolean;
    isVirtual: boolean;
    hypervisorType: string;
    generation: number;
    lastUpdateMicros: number;
    kind: string;
    selfLink: string;
}