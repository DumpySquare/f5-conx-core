/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timings } from "@szmarczak/http-timer/dist/source";
import { AxiosResponse, Method, ResponseType } from "axios";

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
 *   - uri: /mgmt/shared/file-transfer/ucs-downloads/{filname}
 *   - path: /var/local/ucs/{filename}
 * - QKVIEW
 *   - uri: /mgmt/cm/autodeploy/qkview-downloads/{filename}
 *   - path: /var/tmp/{filename}
 * - ISO
 *   - uri: /mgmt/cm/autodeploy/software-image-downloads/{filename}
 *   - path: /shared/images/{filename}
 * 
 * 
 * K04396542: Generating a QKView diagnostic file using the iControl REST API
 *  - https://support.f5.com/csp/article/K04396542
 */
export type F5DownLoad = 'UCS' | 'QKVIEW' | 'ISO'

export interface AxiosResponseWithTimings extends AxiosResponse {
    timings?: Timings;
}

/**
 * custom http response with timings, based on axios response
 */
export type HttpResponse<T = any> = {
    data?: T;
    status: number;
    statusText?: string;
    headers?: unknown;
    config?: {
        url: string;
        httpsAgent: {
            protocol: string
        }
    }
    request?: {
        url: string;
        method: string;
        headers: unknown;
        protocol: string;
        timings: Timings;
        // data?: unknown;
    };
};

// // https://nodejs.org/docs/latest-v12.x/api/http.html#http_http_request_url_options_callback

// // outgoing headers allows numbers (as they are converted internally to strings)
// export type OutgoingHttpHeaders = {
//     [header: string]: number | string | string[] | undefined ;
// }


export type F5HttpRequest = {
    baseURL: string,
    method?: Method,
    url: string,
    headers?: any,
    data?: any,
    validateStatus?: any,
    advancedReturn?: boolean,
    contentType?: string,
    responseType?: ResponseType
}



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