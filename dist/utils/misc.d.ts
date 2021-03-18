/**
 * delays async response of function
 * https://stackoverflow.com/questions/38956121/how-to-add-delay-to-promise-inside-then
 * @param ms time to wait
 * @param value value to return
 */
export declare function wait<T>(ms: number, value?: T): Promise<T>;
/**
 * builds a short randon uuid - just for some randomness during testing
 *
 * @param length
 * @example
 * getRandomUUID(8) // returns 8pSJP15R
 *
 */
export declare function getRandomUUID(length: number, options?: {
    simple: boolean;
}): string;
export declare function isObject(a: unknown): boolean;
export declare function isArray(a: unknown): boolean;
/**
 * Verify file against provided hash
 *
 * @param file local file location
 * @param hash expected SHA 256 hash
 *
 * @returns true/false based on hash verification result
 */
export declare function verifyHash(file: string, extensionHash: string): boolean;
