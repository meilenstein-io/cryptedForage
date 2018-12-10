interface CryptedForageDbInstanceOptions {
    name?: string;

    storeName?: string;
}

interface CryptedForageOptions extends CryptedForageDbInstanceOptions {
    driver?: string | string[];

    size?: number;

    version?: number;

    description?: string;
}

interface CryptedForageDbMethodsCore {
    getItem<T>(key: string, callback?: (err: any, value: T) => void): Promise<T>;

    setItem<T>(key: string, value: T, callback?: (err: any, value: T) => void): Promise<T>;

    removeItem(key: string, callback?: (err: any) => void): Promise<void>;

    clear(callback?: (err: any) => void): Promise<void>;

    length(callback?: (err: any, numberOfKeys: number) => void): Promise<number>;

    key(keyIndex: number, callback?: (err: any, key: string) => void): Promise<string>;

    keys(callback?: (err: any, keys: string[]) => void): Promise<string[]>;

    iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U,
            callback?: (err: any, result: U) => void): Promise<U>;
}

interface CryptedForageDropInstanceFn {
    (dbInstanceOptions?: CryptedForageDbInstanceOptions, callback?: (err: any) => void): Promise<void>;
}

interface CryptedForageDriverMethodsOptional {
    dropInstance?: CryptedForageDropInstanceFn;
}

// duplicating CryptedForageDriverMethodsOptional to preserve TS v2.0 support,
// since Partial<> isn't supported there
interface CryptedForageDbMethodsOptional {
    dropInstance: CryptedForageDropInstanceFn;
}

interface CryptedForageDriverDbMethods extends CryptedForageDbMethodsCore, CryptedForageDriverMethodsOptional {}

interface CryptedForageDriverSupportFunc {
    (): Promise<boolean>;
}

interface CryptedForageDriver extends CryptedForageDriverDbMethods {
    _driver: string;

    _initStorage(options: CryptedForageOptions): void;

    _support?: boolean | CryptedForageDriverSupportFunc;
}

interface CryptedForageSerializer {
    serialize<T>(value: T | ArrayBuffer | Blob, callback: (value: string, error: any) => void): void;

    deserialize<T>(value: string): T | ArrayBuffer | Blob;

    stringToBuffer(serializedString: string): ArrayBuffer;

    bufferToString(buffer: ArrayBuffer): string;
}

interface CryptedForageDbMethods extends CryptedForageDbMethodsCore, CryptedForageDbMethodsOptional {}

interface CryptedForage extends CryptedForageDbMethods {
    LOCALSTORAGE: string;
    WEBSQL: string;
    INDEXEDDB: string;

    /**
     * Set and persist cryptedForage options. This must be called before any other calls to cryptedForage are made, but can be called after cryptedForage is loaded.
     * If you set any config values with this method they will persist after driver changes, so you can call config() then setDriver()
     * @param {CryptedForageOptions} options?
     */
    config(options: CryptedForageOptions): boolean;
    config(options: string): any;
    config(): CryptedForageOptions;

    /**
     * Create a new instance of cryptedForage to point to a different store.
     * All the configuration options used by config are supported.
     * @param {CryptedForageOptions} options
     */
    createInstance(options: CryptedForageOptions): CryptedForage;

    driver(): string;

    /**
     * Force usage of a particular driver or drivers, if available.
     * @param {string} driver
     */
    setDriver(driver: string | string[], callback?: () => void, errorCallback?: (error: any) => void): Promise<void>;

    defineDriver(driver: CryptedForageDriver, callback?: () => void, errorCallback?: (error: any) => void): Promise<void>;

    /**
     * Return a particular driver
     * @param {string} driver
     */
    getDriver(driver: string): Promise<CryptedForageDriver>;

    getSerializer(callback?: (serializer: CryptedForageSerializer) => void): Promise<CryptedForageSerializer>;

    supports(driverName: string): boolean;

    ready(callback?: (error: any) => void): Promise<void>;
}

declare module "cryptedforage" {
    let cryptedforage: CryptedForage;
    export = cryptedforage;
}
