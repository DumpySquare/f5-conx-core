import { Timings } from "@szmarczak/http-timer/dist/source";
import { AxiosRequestConfig, AxiosResponse, Method, ResponseType } from "axios";
export declare type F5HttpRequest = {
    baseURL?: string;
    method?: Method;
    url?: string;
    headers?: any;
    data?: any;
    validateStatus?: any;
    advancedReturn?: boolean;
    contentType?: string;
    responseType?: ResponseType;
    config?: {
        uuid?: string;
    };
};
/**
 * custom http response with timings, based on axios response
 */
export declare type HttpResponse<T = any> = {
    data?: T;
    status: number;
    statusText: string;
    headers: unknown;
    async?: HttpResponse[];
    request?: {
        baseURL: string;
        url: string;
        uuid?: string;
        method: string;
        headers: unknown;
        protocol: string;
        timings: Timings;
    };
};
export interface AxiosResponseWithTimings extends AxiosResponse {
    config: uuidAxiosRequestConfig;
    async?: HttpResponse[];
}
export interface uuidAxiosRequestConfig extends AxiosRequestConfig {
    uuid?: string;
    transport?: unknown;
}
