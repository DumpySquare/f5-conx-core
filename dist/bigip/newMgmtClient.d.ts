/// <reference types="node" />
import { EventEmitter } from 'events';
import { Token, F5DownLoad } from './bigipModels';
/**
 * F5 connectivity mgmt client
 *
 * @param host
 * @param port
 * @param user
 * @param options.password
 * @param options.provider
 *
 */
export declare class NewMgmtClient {
    host: string;
    port: number;
    events: EventEmitter;
    protected _user: string;
    protected _password: string;
    protected _provider: string;
    protected _token: Token | undefined;
    protected _tokenTimeout: number | undefined;
    protected _tokenIntervalId: NodeJS.Timeout | undefined;
    /**
     * @param options function options
     */
    constructor(host: string, user: string, password: string, options?: {
        port?: number;
        provider?: string;
    });
    /**
     *
     * @return event emitter instance
     */
    getEvenEmitter(): EventEmitter;
    /**
     * clear auth token and timer
     *  - used for logging out/disconnecting, and testing
     */
    clearToken(): Promise<number>;
    /**
     * sets/gets/refreshes auth token
     */
    private getToken;
    makeRequest(uri: string): Promise<unknown>;
    download(fileName: string, localDestPath: string, downloadType: F5DownLoad): Promise<unknown>;
}
