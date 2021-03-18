/**
 * basic frame work to interact with iHealth
 *  from Sergio Pereira
 */
export declare class IhealthClient {
    username: string;
    private _password;
    private _api_host;
    private _host;
    private _headers;
    private _authURL;
    private _cookies;
    constructor(username: string, password: string);
    /**
     * Login to iHealth with user creds and save auth cookie
     */
    private login;
    /**
     * clear login token
     *  - to be used when we detect login failure scenario
     */
    private clearLogin;
    /**
     * list qkview IDs = '/qkview-analyzer/api/qkviews/'
     */
    listQkviews(): Promise<void>;
    /**
     * list commands = '/qkview-analyzer/api/qkviews/{qkview_id}/commands'
     *
     * @param id qkview-id
     */
    listCommands(id: string): Promise<void>;
    /**
     * cmd output = '/qkview-analyzer/api/qkviews/{qkview_id}/commands/{a}'
     *
     * @param id qkview-id
     * @param cmd command to execute on qkview
     */
    qkviewCommand(id: string, cmd: string): Promise<void>;
    /**
     * get diagnostics for qkview
     *  - '/qkview-analyzer/api/qkviews/{qkview_id}/diagnostics?set=hit'
     * @param id qkview-id
     */
    getDiagnostics(id: string): Promise<void>;
}
