/**
 * Make generic HTTP request
 *
 * @param host    host where request should be made
 * @param uri     request uri
 * @param options function options
 *
 * @returns response data
 */
export declare function makeRequest(host: string, uri: string, options?: {
    method?: any;
    port?: number;
    body?: object;
    headers?: object;
    basicAuth?: object;
    advancedReturn?: boolean;
}): Promise<object>;
/**
 * Download HTTP payload to file
 *
 * @param url  url
 * @param file local file location where the downloaded contents should go
 *
 * @returns void
 */
export declare function downloadToFile(url: string, file: string): Promise<void>;
/**
 * Parse URL
 *
 * @param url  url
 *
 * @returns parsed url properties
 */
export declare function parseUrl(url: string): {
    host: string;
    path: string;
};
