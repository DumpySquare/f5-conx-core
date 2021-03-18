import { F5Client } from '../bigip/f5Client';
import { MgmtClient } from '../bigip/mgmtClient';
import { Token } from '../bigip/bigipModels';
export declare const defaultHost = "192.0.2.1";
export declare const defaultPort = 443;
export declare const defaultUser = "admin";
export declare const defaultPassword = "@utomateTheW0rld!";
export declare const ipv6Host = "[2607:f0d0:1002:51::5]";
export declare function getMgmtClient(): MgmtClient;
/**
 * Returns F5Client with requested details
 */
export declare function getF5Client(opts?: {
    ipv6?: boolean;
    port?: number;
    provider?: string;
}): F5Client;
/**
 * inclusive random number generator
 *
 * @param min
 * @param max
 */
export declare function getRandomInt(min: number, max: number): number;
/**
 * generates a fake auth token with random value
 *  - passes back username/provider
 */
export declare function getFakeToken(userName: string, authProviderName: string): {
    token: Token;
};
