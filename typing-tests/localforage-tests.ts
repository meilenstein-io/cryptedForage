import * as cryptedforage from 'cryptedforage';

let cryptedForage: CryptedForage = cryptedforage;

namespace CryptedForageTest {
    cryptedForage.clear((err: any) => {
        let newError: any = err;
    });

    cryptedForage.getSerializer().then((s: CryptedForageSerializer) => {
        let serializer: CryptedForageSerializer = s;
        typeof serializer.bufferToString === "function";
        typeof serializer.deserialize === "function";
        typeof serializer.serialize === "function";
        typeof serializer.stringToBuffer === "function";
    });

    cryptedForage.iterate((value, key: string, num: number) => {
        let newStr: any = value;
        let newKey: string = key;
        let newNum: number = num;
    });

    cryptedForage.iterate((value: any, key: string, num: number) => {
        let newStr: any = value;
        let newKey: string = key;
        let newNum: number = num;
    });

    cryptedForage.iterate<any, void>((value: any, key: string, num: number) => {
        let newStr: any = value;
        let newKey: string = key;
        let newNum: number = num;
    });

    cryptedForage.iterate((str: string, key: string, num: number) => {
        let newStr: string = str;
        let newKey: string = key;
        let newNum: number = num;
    });

    cryptedForage.iterate((str: string, key: string, num: number) => {
        let newStr: string = str;
        let newKey: string = key;
        let newNum: number = num;
        if (newStr === 'END') {
            return newNum;
        }
    }).then((result: number | undefined) => {
        if (result) {
            let numResult: number = result;
        }
    });

    cryptedForage.iterate<string, number | void>((str, key: string, num: number) => {
        let newStr: string = str;
        let newKey: string = key;
        let newNum: number = num;
        if (newStr === 'END') {
            return newNum;
        }
    }).then((result: number | void) => {
        if (result) {
            let numResult: number = result;
        }
    });

    cryptedForage.iterate<string, number | void>((str: string, key: string, num: number) => {
        let newStr: string = str;
        let newKey: string = key;
        let newNum: number = num;
        if (newStr === 'END') {
            return newNum;
        }
    }).then((result: number | void) => {
        if (result) {
            let numResult: number = result;
        }
    });

    cryptedForage.length((err: any, num: number) => {
        let newError: any = err;
        let newNumber: number = num;
    });

    cryptedForage.length().then((num: number) => {
        var newNumber: number = num;
    });

    cryptedForage.key(0, (err: any, value: string) => {
        let newError: any = err;
        let newValue: string = value;
    });

    cryptedForage.keys((err: any, keys: Array<string>) => {
        let newError: any = err;
        let newArray: Array<string> = keys;
    });

    cryptedForage.keys().then((keys: Array<string>) => {
        var newArray: Array<string> = keys;
    });

    cryptedForage.getItem("key",(err: any, str: string) => {
        let newError: any = err;
        let newStr: string = str
    });

    cryptedForage.getItem<string>("key").then((str: string) => {
        let newStr: string = str;
    });

    cryptedForage.setItem("key", "value",(err: any, str: string) => {
        let newError: any = err;
        let newStr: string = str
    });

    cryptedForage.setItem("key", "value").then((str: string) => {
        let newStr: string = str;
    });

    cryptedForage.removeItem("key",(err: any) => {
        let newError: any = err;
    });

    cryptedForage.removeItem("key").then(() => {
    });

    const customDriver: CryptedForageDriver = {
        _driver: "CustomDriver",
        _initStorage: (options: CryptedForageOptions) => {},
        getItem: <T>(key: string, callback?: (err: any, value: T) => void) => Promise.resolve({} as T),
        setItem: <T>(key: string, value: T, callback?: (err: any, value: T) => void) => Promise.resolve(value),
        removeItem: (key: string, callback?: (err: any) => void) => Promise.resolve(),
        clear: (callback?: (err: any) => void) => Promise.resolve(),
        length: (callback?: (err: any, numberOfKeys: number) => void) => Promise.resolve(5),
        key: (keyIndex: number, callback?: (err: any, key: string) => void) => Promise.resolve('aKey'),
        keys: (callback?: (err: any, keys: string[]) => void) => Promise.resolve(['1', '2']),
        iterate: <T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U, callback?: (err: any, result: U) => void) => Promise.resolve({} as U),
    };
    cryptedForage.defineDriver(customDriver);

    const customDriver2: CryptedForageDriver = {
        _driver: "CustomDriver",
        _initStorage: (options: CryptedForageOptions) => {},
        _support: true,
        getItem: <T>(key: string, callback?: (err: any, value: T) => void) => Promise.resolve({} as T),
        setItem: <T>(key: string, value: T, callback?: (err: any, value: T) => void) => Promise.resolve(value),
        removeItem: (key: string, callback?: (err: any) => void) => Promise.resolve(),
        clear: (callback?: (err: any) => void) => Promise.resolve(),
        length: (callback?: (err: any, numberOfKeys: number) => void) => Promise.resolve(5),
        key: (keyIndex: number, callback?: (err: any, key: string) => void) => Promise.resolve('aKey'),
        keys: (callback?: (err: any, keys: string[]) => void) => Promise.resolve(['1', '2']),
        iterate: <T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U, callback?: (err: any, result: U) => void) => Promise.resolve({} as U),
    };
    cryptedForage.defineDriver(customDriver2);

    const customDriver3: CryptedForageDriver = {
        _driver: "CustomDriver",
        _initStorage: (options: CryptedForageOptions) => {},
        _support: () => Promise.resolve(true),
        getItem: <T>(key: string, callback?: (err: any, value: T) => void) => Promise.resolve({} as T),
        setItem: <T>(key: string, value: T, callback?: (err: any, value: T) => void) => Promise.resolve(value),
        removeItem: (key: string, callback?: (err: any) => void) => Promise.resolve(),
        clear: (callback?: (err: any) => void) => Promise.resolve(),
        length: (callback?: (err: any, numberOfKeys: number) => void) => Promise.resolve(5),
        key: (keyIndex: number, callback?: (err: any, key: string) => void) => Promise.resolve('aKey'),
        keys: (callback?: (err: any, keys: string[]) => void) => Promise.resolve(['1', '2']),
        iterate: <T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U, callback?: (err: any, result: U) => void) => Promise.resolve({} as U),
        dropInstance: (dbInstanceOptions?: CryptedForageDbInstanceOptions, callback?: (err: any) => void) => Promise.resolve(),
    };
    cryptedForage.defineDriver(customDriver3);

    cryptedForage.getDriver("CustomDriver").then((result: CryptedForageDriver) => {
        var driver: CryptedForageDriver = result;
        // we need to use a variable for proper type guards before TS 2.0
        var _support = driver._support;
        if (typeof _support === "function") {
            // _support = _support.bind(driver);
            _support().then((result: boolean) => {
                let doesSupport: boolean = result;
            });
        } else if (typeof _support === "boolean") {
            let doesSupport: boolean = _support;
        }
    });

    {
        let config: boolean;

        const configOptions: CryptedForageOptions = {
            name: "testyo",
            driver: cryptedForage.LOCALSTORAGE
        };

        config = cryptedForage.config(configOptions);
        config = cryptedForage.config({
            name: "testyo",
            driver: cryptedForage.LOCALSTORAGE
        });
    }

    {
        let store: CryptedForage;

        const configOptions: CryptedForageOptions = {
            name: "da instance",
            driver: cryptedForage.LOCALSTORAGE
        };

        store = cryptedForage.createInstance(configOptions);
        store = cryptedForage.createInstance({
            name: "da instance",
            driver: cryptedForage.LOCALSTORAGE
        });
    }

    {
        cryptedForage.dropInstance().then(() => {});

        const dropInstanceOptions: CryptedForageDbInstanceOptions = {
            name: "da instance",
            storeName: "da store"
        };

        cryptedForage.dropInstance(dropInstanceOptions).then(() => {});

        cryptedForage.dropInstance({
            name: "da instance",
            storeName: "da store"
        }).then(() => {});

        const dropDbOptions: CryptedForageDbInstanceOptions = {
            name: "da instance",
        };

        cryptedForage.dropInstance({
            name: "da instance",
        }).then(() => {});
    }

    {
        let testSerializer: CryptedForageSerializer;

        cryptedForage.getSerializer()
        .then((serializer: CryptedForageSerializer) => {
            testSerializer = serializer;
        });

        cryptedForage.getSerializer((serializer: CryptedForageSerializer) => {
            testSerializer = serializer;
        });
    }

    {
        cryptedForage.ready().then(() => {});

        cryptedForage.ready((error) => {
            if (error) {

            } else {
                
            }
        });
    }
}
