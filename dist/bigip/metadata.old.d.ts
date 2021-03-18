/**
 * this is the original f5-sdk-js atc meta data client
 */
export declare class MetadataClient {
    protected _component: string;
    protected _componentVersion: string;
    protected _metadata: unknown;
    /**
     *
     * @param component        component name
     * @param componentVersion component version
     *
     * @returns void
     */
    constructor(component: string, options: {
        componentVersion?: string;
    });
    /**
     * Get component name
     *
     * @returns component name
     */
    getComponentName(): string;
    /**
     * Get component package name
     *
     * @returns component version
     */
    getComponentPackageName(): string;
    /**
     * Get component version
     *
     * @returns component version
     */
    getComponentVersion(): string;
    /**
     * Get component version
     *
     * @returns component version
     */
    getComponentVersionsList(): Array<string>;
    /**
     * Get configuration endpoint
     *
     * @returns configuration endpoint properties
     */
    getConfigurationEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    };
    /**
     * Get download package
     *
     * @returns package download name
     */
    getDownloadPackageName(): string;
    /**
     * Get download URL
     *
     * @returns full download URL
     */
    getDownloadUrl(): string;
    /**
     * Get info endpoint
     *
     * @returns info endpoint properties
     */
    getInfoEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    };
    /**
     * Get inspect endpoint
     *
     * @returns info endpoint properties
     */
    getInspectEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    };
    /**
     * Get 'latest' metadata
     *
     * @returns void
     */
    getLatestMetadata(): Promise<void>;
    /**
     * Get latest component version
     *
     * @returns get latest component version
     */
    getLatestVersion(): string;
    /**
     * Get trigger endpoint
     *
     * @returns info endpoint properties
     */
    getResetEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    };
    /**
     * Get trigger endpoint
     *
     * @returns info endpoint properties
     */
    getTriggerEndpoint(): {
        endpoint: string;
        methods: Array<string>;
    };
    protected _loadLocalMetadata(): object;
    protected _getComponentMetadata(): object;
    protected _getComponentVersionMetadata(): object;
}
