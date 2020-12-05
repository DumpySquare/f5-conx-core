/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { Timings } from "@szmarczak/http-timer/dist/source";
import { AxiosResponse, Method, ResponseType } from "axios";



export type F5HttpRequest = {
    baseURL?: string,
    method?: Method,
    url?: string,
    headers?: any,
    data?: any,
    validateStatus?: any,
    advancedReturn?: boolean,
    contentType?: string,
    responseType?: ResponseType
}

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
    };
};