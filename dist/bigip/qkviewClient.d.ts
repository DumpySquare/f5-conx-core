import { HttpResponse } from "../utils/httpModels";
import { MgmtClient } from "./mgmtClient";
export declare class QkviewClient {
    readonly mgmtClient: MgmtClient;
    constructor(mgmtClient: MgmtClient);
    get(dest: string, name?: string): Promise<HttpResponse>;
    /**
     *
     * @param name qkview name (must include .qkview)
     */
    create(name?: string): Promise<HttpResponse>;
    list(): Promise<HttpResponse>;
    download(fileName: string, localPath: string): Promise<HttpResponse>;
    /**
     * delete qkview by id on f5
     * @param id system qkview id
     */
    delete(id: string): Promise<HttpResponse>;
}
