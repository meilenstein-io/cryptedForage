/* global after:true, afterEach:true, before:true, beforeEach:true, describe:true, expect:true, it:true, Promise:true */
var DRIVERS = [
    cryptedforage.INDEXEDDB,
    cryptedforage.WEBSQL,
    cryptedforage.LOCALSTORAGE
];

var SUPPORTED_DRIVERS = DRIVERS.filter(function(driverName) {
    return cryptedforage.supports(driverName);
});

var driverApiMethods = [
    'getItem',
    'setItem',
    'clear',
    'length',
    'removeItem',
    'key',
    'keys'
];

var indexedDB =
    // eslint-disable-next-line no-use-before-define
    indexedDB ||
    window.indexedDB ||
    window.webkitIndexedDB ||
    window.mozIndexedDB ||
    window.OIndexedDB ||
    window.msIndexedDB;

describe('cryptedForage API', function() {
    // https://github.com/mozilla/cryptedForage#working-on-cryptedforage
    it('has Promises available', function() {
        expect(Promise).to.be.a('function');
    });
});

describe('cryptedForage', function() {
    var appropriateDriver =
        (cryptedforage.supports(cryptedforage.INDEXEDDB) &&
            cryptedforage.INDEXEDDB) ||
        (cryptedforage.supports(cryptedforage.WEBSQL) &&
            cryptedforage.WEBSQL) ||
        (cryptedforage.supports(cryptedforage.LOCALSTORAGE) &&
            cryptedforage.LOCALSTORAGE);

    it(
        'automatically selects the most appropriate driver (' +
            appropriateDriver +
            ')',
        function(done) {
            this.timeout(10000);
            cryptedforage.ready().then(
                function() {
                    expect(cryptedforage.driver()).to.be(appropriateDriver);
                    done();
                },
                function(error) {
                    expect(error).to.be.an(Error);
                    expect(error.message).to.be(
                        'No available storage method found.'
                    );
                    expect(cryptedforage.driver()).to.be(null);
                    done();
                }
            );
        }
    );

    it('errors when a requested driver is not found [callback]', function(done) {
        cryptedforage.getDriver('UnknownDriver', null, function(error) {
            expect(error).to.be.an(Error);
            expect(error.message).to.be('Driver not found.');
            done();
        });
    });

    it('errors when a requested driver is not found [promise]', function(done) {
        cryptedforage.getDriver('UnknownDriver').then(null, function(error) {
            expect(error).to.be.an(Error);
            expect(error.message).to.be('Driver not found.');
            done();
        });
    });

    it('retrieves the serializer [callback]', function(done) {
        cryptedforage.getSerializer(function(serializer) {
            expect(serializer).to.be.an('object');
            done();
        });
    });

    it('retrieves the serializer [promise]', function(done) {
        var serializerPromise = cryptedforage.getSerializer();
        expect(serializerPromise).to.be.an('object');
        expect(serializerPromise.then).to.be.a('function');

        serializerPromise.then(function(serializer) {
            expect(serializer).to.be.an('object');
            done();
        });
    });

    it('does not support object parameter to setDriver', function(done) {
        var driverPreferedOrder = {
            '0': cryptedforage.INDEXEDDB,
            '1': cryptedforage.WEBSQL,
            '2': cryptedforage.LOCALSTORAGE,
            length: 3
        };

        cryptedforage
            .setDriver(driverPreferedOrder)
            .then(null, function(error) {
                expect(error).to.be.an(Error);
                expect(error.message).to.be(
                    'No available storage method found.'
                );
                done();
            });
    });

    it('skips drivers that fail to initilize', function(done) {
        var failingStorageDriver = (function() {
            function driverDummyMethod() {
                return Promise.reject(new Error('Driver Method Failed.'));
            }

            return {
                _driver: 'failingStorageDriver',
                _initStorage: function _initStorage() {
                    return Promise.reject(
                        new Error('Driver Failed to Initialize.')
                    );
                },
                iterate: driverDummyMethod,
                getItem: driverDummyMethod,
                setItem: driverDummyMethod,
                removeItem: driverDummyMethod,
                clear: driverDummyMethod,
                length: driverDummyMethod,
                key: driverDummyMethod,
                keys: driverDummyMethod
            };
        })();

        var driverPreferedOrder = [
            failingStorageDriver._driver,
            cryptedforage.INDEXEDDB,
            cryptedforage.WEBSQL,
            cryptedforage.LOCALSTORAGE
        ];

        cryptedforage
            .defineDriver(failingStorageDriver)
            .then(function() {
                return cryptedforage.setDriver(driverPreferedOrder);
            })
            .then(function() {
                return cryptedforage.ready();
            })
            .then(function() {
                expect(cryptedforage.driver()).to.be(appropriateDriver);
                done();
            });
    });

    describe('createInstance()', function() {
        var oldConsoleInfo;

        before(function() {
            oldConsoleInfo = console.info;
            var logs = [];
            console.info = function() {
                console.info.logs.push({
                    args: arguments
                });
                oldConsoleInfo.apply(this, arguments);
            };
            console.info.logs = logs;
        });

        after(function() {
            console.info = oldConsoleInfo;
        });

        it('does not log unnecessary messages', function() {
            var oldLogCount = console.info.logs.length;
            var cryptedforage2 = cryptedforage.createInstance();
            var cryptedforage3 = cryptedforage.createInstance();

            return Promise.all([
                cryptedforage.ready(),
                cryptedforage2.ready(),
                cryptedforage3.ready()
            ]).then(function() {
                expect(console.info.logs.length).to.be(oldLogCount);
            });
        });
    });
});

SUPPORTED_DRIVERS.forEach(function(driverName) {
    describe(driverName + ' driver', function() {
        'use strict';

        this.timeout(30000);

        before(function(done) {
            cryptedforage.setDriver(driverName).then(done);
        });

        beforeEach(function(done) {
            localStorage.clear();
            cryptedforage.ready().then(function() {
                cryptedforage.clear(done);
            });
        });

        it('has a localStorage API', function() {
            expect(cryptedforage.getItem).to.be.a('function');
            expect(cryptedforage.setItem).to.be.a('function');
            expect(cryptedforage.clear).to.be.a('function');
            expect(cryptedforage.length).to.be.a('function');
            expect(cryptedforage.removeItem).to.be.a('function');
            expect(cryptedforage.key).to.be.a('function');
        });

        it('has the cryptedForage API', function() {
            expect(cryptedforage._initStorage).to.be.a('function');
            expect(cryptedforage.config).to.be.a('function');
            expect(cryptedforage.defineDriver).to.be.a('function');
            expect(cryptedforage.driver).to.be.a('function');
            expect(cryptedforage.supports).to.be.a('function');
            expect(cryptedforage.iterate).to.be.a('function');
            expect(cryptedforage.getItem).to.be.a('function');
            expect(cryptedforage.setItem).to.be.a('function');
            expect(cryptedforage.clear).to.be.a('function');
            expect(cryptedforage.length).to.be.a('function');
            expect(cryptedforage.removeItem).to.be.a('function');
            expect(cryptedforage.key).to.be.a('function');
            expect(cryptedforage.getDriver).to.be.a('function');
            expect(cryptedforage.setDriver).to.be.a('function');
            expect(cryptedforage.ready).to.be.a('function');
            expect(cryptedforage.createInstance).to.be.a('function');
            expect(cryptedforage.getSerializer).to.be.a('function');
            expect(cryptedforage.dropInstance).to.be.a('function');
        });

        // Make sure we don't support bogus drivers.
        it('supports ' + driverName + ' database driver', function() {
            expect(cryptedforage.supports(driverName) === true);
            expect(cryptedforage.supports('I am not a driver') === false);
        });

        it('sets the right database driver', function() {
            expect(cryptedforage.driver() === driverName);
        });

        it('has an empty length by default', function(done) {
            cryptedforage.length(function(err, length) {
                expect(length).to.be(0);
                done();
            });
        });

        if (driverName === cryptedforage.INDEXEDDB) {
            describe('Blob support', function() {
                var transaction;
                var called;
                var db;
                var blob = new Blob([''], { type: 'image/png' });

                before(function() {
                    db = cryptedforage._dbInfo.db;
                    transaction = db.transaction;
                    db.transaction = function() {
                        called += 1;
                        return transaction.apply(db, arguments);
                    };
                });

                beforeEach(function() {
                    called = 0;
                });

                it('not check for non Blob', function(done) {
                    cryptedforage.setItem('key', {}).then(
                        function() {
                            expect(called).to.be(1);
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                it('check for Blob', function(done) {
                    cryptedforage.setItem('key', blob).then(
                        function() {
                            expect(called).to.be.above(1);
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                it('check for Blob once', function(done) {
                    cryptedforage.setItem('key', blob).then(
                        function() {
                            expect(called).to.be(1);
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                after(function() {
                    cryptedforage._dbInfo.db.transaction = transaction;
                });
            });

            describe('recover (reconnect) from IDBDatabase InvalidStateError', function() {
                beforeEach(function(done) {
                    Promise.all([
                        cryptedforage.setItem('key', 'value1'),
                        cryptedforage.setItem('key1', 'value1'),
                        cryptedforage.setItem('key2', 'value2'),
                        cryptedforage.setItem('key3', 'value3')
                    ]).then(
                        function() {
                            cryptedforage._dbInfo.db.close();
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                it('retrieves an item from the storage', function(done) {
                    cryptedforage.getItem('key').then(
                        function(value) {
                            expect(value).to.be('value1');
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                it('retrieves more than one items from the storage', function(done) {
                    Promise.all([
                        cryptedforage.getItem('key1'),
                        cryptedforage.getItem('key2'),
                        cryptedforage.getItem('key3')
                    ]).then(
                        function(values) {
                            expect(values).to.eql([
                                'value1',
                                'value2',
                                'value3'
                            ]);
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                it('stores and retrieves an item from the storage', function(done) {
                    cryptedforage
                        .setItem('key', 'value1b')
                        .then(function() {
                            return cryptedforage.getItem('key');
                        })
                        .then(
                            function(value) {
                                expect(value).to.be('value1b');
                                done();
                            },
                            function(error) {
                                done(error || 'error');
                            }
                        );
                });

                it('stores and retrieves more than one items from the storage', function(done) {
                    Promise.all([
                        cryptedforage.setItem('key1', 'value1b'),
                        cryptedforage.setItem('key2', 'value2b'),
                        cryptedforage.setItem('key3', 'value3b')
                    ])
                        .then(function() {
                            return Promise.all([
                                cryptedforage.getItem('key1'),
                                cryptedforage.getItem('key2'),
                                cryptedforage.getItem('key3')
                            ]);
                        })
                        .then(
                            function(values) {
                                expect(values).to.eql([
                                    'value1b',
                                    'value2b',
                                    'value3b'
                                ]);
                                done();
                            },
                            function(error) {
                                done(error || 'error');
                            }
                        );
                });
            });
        }

        if (driverName === cryptedforage.WEBSQL) {
            describe('on QUOTA ERROR', function() {
                var transaction;
                var called;
                var db;

                function getQuotaErrorCode(transaction) {
                    return new Promise(function(resolve) {
                        transaction(
                            function(t) {
                                t.executeSql('');
                            },
                            function(err) {
                                resolve(err.QUOTA_ERR);
                            }
                        );
                    }).catch(function(err) {
                        return err.QUOTA_ERR;
                    });
                }

                beforeEach(function() {
                    called = 0;
                    db = cryptedforage._dbInfo.db;
                    transaction = db.transaction;

                    db.transaction = function(fn, errFn) {
                        called += 1;
                        // restore the normal transaction,
                        // so that subsequent operations work
                        db.transaction = transaction;

                        getQuotaErrorCode(transaction).then(function(
                            QUOTA_ERR
                        ) {
                            var error = new Error();
                            error.code = QUOTA_ERR;
                            errFn(error);
                        });
                    };
                });

                it('should retry setItem', function(done) {
                    cryptedforage.setItem('key', {}).then(
                        function() {
                            expect(called).to.be(1);
                            done();
                        },
                        function(error) {
                            done(error || 'error');
                        }
                    );
                });

                after(function() {
                    db.transaction = transaction || db.transaction;
                });
            });
        }

        it('should iterate [callback]', function(done) {
            cryptedforage.setItem('officeX', 'InitechX', function(
                err,
                setValue
            ) {
                expect(setValue).to.be('InitechX');

                cryptedforage.getItem('officeX', function(err, value) {
                    expect(value).to.be(setValue);

                    cryptedforage.setItem('officeY', 'InitechY', function(
                        err,
                        setValue
                    ) {
                        expect(setValue).to.be('InitechY');

                        cryptedforage.getItem('officeY', function(err, value) {
                            expect(value).to.be(setValue);

                            var accumulator = {};
                            var iterationNumbers = [];

                            cryptedforage.iterate(
                                function(value, key, iterationNumber) {
                                    accumulator[key] = value;
                                    iterationNumbers.push(iterationNumber);
                                },
                                function() {
                                    try {
                                        expect(accumulator.officeX).to.be(
                                            'InitechX'
                                        );
                                        expect(accumulator.officeY).to.be(
                                            'InitechY'
                                        );
                                        expect(iterationNumbers).to.eql([1, 2]);
                                        done();
                                    } catch (e) {
                                        done(e);
                                    }
                                }
                            );
                        });
                    });
                });
            });
        });

        it('should iterate [promise]', function(done) {
            var accumulator = {};
            var iterationNumbers = [];

            return cryptedforage
                .setItem('officeX', 'InitechX')
                .then(function(setValue) {
                    expect(setValue).to.be('InitechX');
                    return cryptedforage.getItem('officeX');
                })
                .then(function(value) {
                    expect(value).to.be('InitechX');
                    return cryptedforage.setItem('officeY', 'InitechY');
                })
                .then(function(setValue) {
                    expect(setValue).to.be('InitechY');
                    return cryptedforage.getItem('officeY');
                })
                .then(function(value) {
                    expect(value).to.be('InitechY');

                    return cryptedforage.iterate(function(
                        value,
                        key,
                        iterationNumber
                    ) {
                        accumulator[key] = value;
                        iterationNumbers.push(iterationNumber);
                    });
                })
                .then(function() {
                    expect(accumulator.officeX).to.be('InitechX');
                    expect(accumulator.officeY).to.be('InitechY');
                    expect(iterationNumbers).to.eql([1, 2]);
                    done();
                });
        });

        it('should break iteration with defined return value [callback]', function(done) {
            var breakCondition = 'Some value!';

            cryptedforage.setItem('officeX', 'InitechX', function(
                err,
                setValue
            ) {
                expect(setValue).to.be('InitechX');

                cryptedforage.getItem('officeX', function(err, value) {
                    expect(value).to.be(setValue);

                    cryptedforage.setItem('officeY', 'InitechY', function(
                        err,
                        setValue
                    ) {
                        expect(setValue).to.be('InitechY');

                        cryptedforage.getItem('officeY', function(err, value) {
                            expect(value).to.be(setValue);

                            // Loop is broken within first iteration.
                            cryptedforage.iterate(
                                function() {
                                    // Returning defined value will break the cycle.
                                    return breakCondition;
                                },
                                function(err, loopResult) {
                                    // The value that broken the cycle is returned
                                    // as a result.
                                    expect(loopResult).to.be(breakCondition);

                                    done();
                                }
                            );
                        });
                    });
                });
            });
        });

        it('should break iteration with defined return value [promise]', function(done) {
            var breakCondition = 'Some value!';

            cryptedforage
                .setItem('officeX', 'InitechX')
                .then(function(setValue) {
                    expect(setValue).to.be('InitechX');
                    return cryptedforage.getItem('officeX');
                })
                .then(function(value) {
                    expect(value).to.be('InitechX');
                    return cryptedforage.setItem('officeY', 'InitechY');
                })
                .then(function(setValue) {
                    expect(setValue).to.be('InitechY');
                    return cryptedforage.getItem('officeY');
                })
                .then(function(value) {
                    expect(value).to.be('InitechY');
                    return cryptedforage.iterate(function() {
                        return breakCondition;
                    });
                })
                .then(function(result) {
                    expect(result).to.be(breakCondition);
                    done();
                });
        });

        it('should iterate() through only its own keys/values', function(done) {
            localStorage.setItem('local', 'forage');
            cryptedforage
                .setItem('office', 'Initech')
                .then(function() {
                    return cryptedforage.setItem('name', 'Bob');
                })
                .then(function() {
                    // Loop through all key/value pairs; {local: 'forage'} set
                    // manually should not be returned.
                    var numberOfItems = 0;
                    var iterationNumberConcat = '';

                    localStorage.setItem('locals', 'forages');

                    cryptedforage.iterate(
                        function(value, key, iterationNumber) {
                            expect(key).to.not.be('local');
                            expect(value).to.not.be('forage');
                            numberOfItems++;
                            iterationNumberConcat += iterationNumber;
                        },
                        function(err) {
                            if (!err) {
                                // While there are 4 items in localStorage,
                                // only 2 items were set using cryptedForage.
                                expect(numberOfItems).to.be(2);

                                // Only 2 items were set using cryptedForage,
                                // so we should get '12' and not '1234'
                                expect(iterationNumberConcat).to.be('12');

                                done();
                            }
                        }
                    );
                });
        });

        // Test for https://github.com/mozilla/cryptedForage/issues/175
        it('nested getItem inside clear works [callback]', function(done) {
            cryptedforage.setItem('hello', 'Hello World !', function() {
                cryptedforage.clear(function() {
                    cryptedforage.getItem('hello', function(secondValue) {
                        expect(secondValue).to.be(null);
                        done();
                    });
                });
            });
        });
        it('nested getItem inside clear works [promise]', function(done) {
            cryptedforage
                .setItem('hello', 'Hello World !')
                .then(function() {
                    return cryptedforage.clear();
                })
                .then(function() {
                    return cryptedforage.getItem('hello');
                })
                .then(function(secondValue) {
                    expect(secondValue).to.be(null);
                    done();
                });
        });

        // Because localStorage doesn't support saving the `undefined` type, we
        // always return `null` so that cryptedForage is consistent across
        // browsers.
        // https://github.com/mozilla/cryptedForage/pull/42
        it('returns null for undefined key [callback]', function(done) {
            cryptedforage.getItem('key', function(err, value) {
                expect(value).to.be(null);
                done();
            });
        });

        it('returns null for undefined key [promise]', function(done) {
            cryptedforage.getItem('key').then(function(value) {
                expect(value).to.be(null);
                done();
            });
        });

        it('saves an item [callback]', function(done) {
            cryptedforage.setItem('office', 'Initech', function(err, setValue) {
                expect(setValue).to.be('Initech');

                cryptedforage.getItem('office', function(err, value) {
                    expect(value).to.be(setValue);
                    done();
                });
            });
        });

        it('saves an item [promise]', function(done) {
            cryptedforage
                .setItem('office', 'Initech')
                .then(function(setValue) {
                    expect(setValue).to.be('Initech');

                    return cryptedforage.getItem('office');
                })
                .then(function(value) {
                    expect(value).to.be('Initech');
                    done();
                });
        });

        it('saves an item over an existing key [callback]', function(done) {
            cryptedforage.setItem('4th floor', 'Mozilla', function(
                err,
                setValue
            ) {
                expect(setValue).to.be('Mozilla');

                cryptedforage.setItem('4th floor', 'Quora', function(
                    err,
                    newValue
                ) {
                    expect(newValue).to.not.be(setValue);
                    expect(newValue).to.be('Quora');

                    cryptedforage.getItem('4th floor', function(err, value) {
                        expect(value).to.not.be(setValue);
                        expect(value).to.be(newValue);
                        done();
                    });
                });
            });
        });
        it('saves an item over an existing key [promise]', function(done) {
            cryptedforage
                .setItem('4e', 'Mozilla')
                .then(function(setValue) {
                    expect(setValue).to.be('Mozilla');

                    return cryptedforage.setItem('4e', 'Quora');
                })
                .then(function(newValue) {
                    expect(newValue).to.not.be('Mozilla');
                    expect(newValue).to.be('Quora');

                    return cryptedforage.getItem('4e');
                })
                .then(function(value) {
                    expect(value).to.not.be('Mozilla');
                    expect(value).to.be('Quora');
                    done();
                });
        });

        it('returns null when saving undefined [callback]', function(done) {
            cryptedforage.setItem('undef', undefined, function(err, setValue) {
                expect(setValue).to.be(null);

                done();
            });
        });
        it('returns null when saving undefined [promise]', function(done) {
            cryptedforage.setItem('undef', undefined).then(function(setValue) {
                expect(setValue).to.be(null);

                done();
            });
        });

        it('returns null when saving null [callback]', function(done) {
            cryptedforage.setItem('null', null, function(err, setValue) {
                expect(setValue).to.be(null);

                done();
            });
        });
        it('returns null when saving null [promise]', function(done) {
            cryptedforage.setItem('null', null).then(function(setValue) {
                expect(setValue).to.be(null);

                done();
            });
        });

        it('returns null for a non-existant key [callback]', function(done) {
            cryptedforage.getItem('undef', function(err, value) {
                expect(value).to.be(null);

                done();
            });
        });
        it('returns null for a non-existant key [promise]', function(done) {
            cryptedforage.getItem('undef').then(function(value) {
                expect(value).to.be(null);

                done();
            });
        });

        // github.com/mozilla/cryptedforage/pull/24#discussion-diff-9389662R158
        // localStorage's method API (`localStorage.getItem('foo')`) returns
        // `null` for undefined keys, even though its getter/setter API
        // (`localStorage.foo`) returns `undefined` for the same key. Gaia's
        // asyncStorage API, which is based on localStorage and upon which
        // cryptedforage is based, ALSO returns `null`. BLARG! So for now, we
        // just return null, because there's no way to know from localStorage
        // if the key is ACTUALLY `null` or undefined but returning `null`.
        // And returning `undefined` here would break compatibility with
        // localStorage fallback. Maybe in the future we won't care...
        it('returns null from an undefined key [callback]', function(done) {
            cryptedforage.key(0, function(err, key) {
                expect(key).to.be(null);

                done();
            });
        });
        it('returns null from an undefined key [promise]', function(done) {
            cryptedforage.key(0).then(function(key) {
                expect(key).to.be(null);

                done();
            });
        });

        it('returns key name [callback]', function(done) {
            cryptedforage.setItem('office', 'Initech').then(function() {
                cryptedforage.key(0, function(err, key) {
                    expect(key).to.be('office');

                    done();
                });
            });
        });
        it('returns key name [promise]', function(done) {
            cryptedforage
                .setItem('office', 'Initech')
                .then(function() {
                    return cryptedforage.key(0);
                })
                .then(function(key) {
                    expect(key).to.be('office');

                    done();
                });
        });

        it('removes an item [callback]', function(done) {
            cryptedforage.setItem('office', 'Initech', function() {
                cryptedforage.setItem('otherOffice', 'Initrode', function() {
                    cryptedforage.removeItem('office', function() {
                        cryptedforage.getItem('office', function(
                            err,
                            emptyValue
                        ) {
                            expect(emptyValue).to.be(null);

                            cryptedforage.getItem('otherOffice', function(
                                err,
                                value
                            ) {
                                expect(value).to.be('Initrode');

                                done();
                            });
                        });
                    });
                });
            });
        });
        it('removes an item [promise]', function(done) {
            cryptedforage
                .setItem('office', 'Initech')
                .then(function() {
                    return cryptedforage.setItem('otherOffice', 'Initrode');
                })
                .then(function() {
                    return cryptedforage.removeItem('office');
                })
                .then(function() {
                    return cryptedforage.getItem('office');
                })
                .then(function(emptyValue) {
                    expect(emptyValue).to.be(null);

                    return cryptedforage.getItem('otherOffice');
                })
                .then(function(value) {
                    expect(value).to.be('Initrode');

                    done();
                });
        });

        it('removes all items [callback]', function(done) {
            cryptedforage.setItem('office', 'Initech', function() {
                cryptedforage.setItem('otherOffice', 'Initrode', function() {
                    cryptedforage.length(function(err, length) {
                        expect(length).to.be(2);

                        cryptedforage.clear(function() {
                            cryptedforage.getItem('office', function(
                                err,
                                value
                            ) {
                                expect(value).to.be(null);

                                cryptedforage.length(function(err, length) {
                                    expect(length).to.be(0);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        it('removes all items [promise]', function(done) {
            cryptedforage
                .setItem('office', 'Initech')
                .then(function() {
                    return cryptedforage.setItem('otherOffice', 'Initrode');
                })
                .then(function() {
                    return cryptedforage.length();
                })
                .then(function(length) {
                    expect(length).to.be(2);

                    return cryptedforage.clear();
                })
                .then(function() {
                    return cryptedforage.getItem('office');
                })
                .then(function(value) {
                    expect(value).to.be(null);

                    return cryptedforage.length();
                })
                .then(function(length) {
                    expect(length).to.be(0);

                    done();
                });
        });

        if (driverName === cryptedforage.LOCALSTORAGE) {
            it('removes only own items upon clear', function(done) {
                localStorage.setItem('local', 'forage');

                cryptedforage
                    .setItem('office', 'Initech')
                    .then(function() {
                        return cryptedforage.clear();
                    })
                    .then(function() {
                        expect(localStorage.getItem('local')).to.be('forage');

                        localStorage.clear();

                        done();
                    });
            });

            it('returns only its own keys from keys()', function(done) {
                localStorage.setItem('local', 'forage');

                cryptedforage
                    .setItem('office', 'Initech')
                    .then(function() {
                        return cryptedforage.keys();
                    })
                    .then(function(keys) {
                        expect(keys).to.eql(['office']);

                        localStorage.clear();

                        done();
                    });
            });

            it('counts only its own items with length()', function(done) {
                localStorage.setItem('local', 'forage');
                localStorage.setItem('another', 'value');

                cryptedforage
                    .setItem('office', 'Initech')
                    .then(function() {
                        return cryptedforage.length();
                    })
                    .then(function(length) {
                        expect(length).to.be(1);

                        localStorage.clear();

                        done();
                    });
            });
        }

        it('has a length after saving an item [callback]', function(done) {
            cryptedforage.length(function(err, length) {
                expect(length).to.be(0);
                cryptedforage.setItem('rapper', 'Black Thought', function() {
                    cryptedforage.length(function(err, length) {
                        expect(length).to.be(1);

                        done();
                    });
                });
            });
        });
        it('has a length after saving an item [promise]', function(done) {
            cryptedforage
                .length()
                .then(function(length) {
                    expect(length).to.be(0);

                    return cryptedforage.setItem('lame rapper', 'Vanilla Ice');
                })
                .then(function() {
                    return cryptedforage.length();
                })
                .then(function(length) {
                    expect(length).to.be(1);

                    done();
                });
        });

        // Deal with non-string keys, see issue #250
        // https://github.com/mozilla/cryptedForage/issues/250
        it('casts an undefined key to a String', function(done) {
            cryptedforage
                .setItem(undefined, 'goodness!')
                .then(function(value) {
                    expect(value).to.be('goodness!');

                    return cryptedforage.getItem(undefined);
                })
                .then(function(value) {
                    expect(value).to.be('goodness!');

                    return cryptedforage.removeItem(undefined);
                })
                .then(function() {
                    return cryptedforage.length();
                })
                .then(function(length) {
                    expect(length).to.be(0);
                    done();
                });
        });

        it('casts a null key to a String', function(done) {
            cryptedforage
                .setItem(null, 'goodness!')
                .then(function(value) {
                    expect(value).to.be('goodness!');

                    return cryptedforage.getItem(null);
                })
                .then(function(value) {
                    expect(value).to.be('goodness!');

                    return cryptedforage.removeItem(null);
                })
                .then(function() {
                    return cryptedforage.length();
                })
                .then(function(length) {
                    expect(length).to.be(0);
                    done();
                });
        });

        it('casts a float key to a String', function(done) {
            cryptedforage
                .setItem(537.35737, 'goodness!')
                .then(function(value) {
                    expect(value).to.be('goodness!');

                    return cryptedforage.getItem(537.35737);
                })
                .then(function(value) {
                    expect(value).to.be('goodness!');

                    return cryptedforage.removeItem(537.35737);
                })
                .then(function() {
                    return cryptedforage.length();
                })
                .then(function(length) {
                    expect(length).to.be(0);
                    done();
                });
        });

        it('is retrieved by getDriver [callback]', function(done) {
            cryptedforage.getDriver(driverName, function(driver) {
                expect(typeof driver).to.be('object');
                driverApiMethods
                    .concat('_initStorage')
                    .forEach(function(methodName) {
                        expect(typeof driver[methodName]).to.be('function');
                    });
                expect(driver._driver).to.be(driverName);
                done();
            });
        });

        it('is retrieved by getDriver [promise]', function(done) {
            cryptedforage.getDriver(driverName).then(function(driver) {
                expect(typeof driver).to.be('object');
                driverApiMethods
                    .concat('_initStorage')
                    .forEach(function(methodName) {
                        expect(typeof driver[methodName]).to.be('function');
                    });
                expect(driver._driver).to.be(driverName);
                done();
            });
        });

        if (
            driverName === cryptedforage.WEBSQL ||
            driverName === cryptedforage.LOCALSTORAGE
        ) {
            it('exposes the serializer on the dbInfo object', function(done) {
                cryptedforage.ready().then(function() {
                    expect(cryptedforage._dbInfo.serializer).to.be.an('object');
                    done();
                });
            });
        }
    });

    function prepareStorage(storageName) {
        // Delete IndexedDB storages (start from scratch)
        // Refers to issue #492 - https://github.com/mozilla/cryptedForage/issues/492
        if (driverName === cryptedforage.INDEXEDDB) {
            return new Promise(function(resolve) {
                indexedDB.deleteDatabase(storageName).onsuccess = resolve;
            });
        }

        // Otherwise, do nothing
        return Promise.resolve();
    }

    describe(driverName + ' driver multiple instances', function() {
        'use strict';

        this.timeout(30000);

        var cryptedforage2 = null;
        var cryptedforage3 = null;

        before(function(done) {
            prepareStorage('storage2').then(function() {
                cryptedforage2 = cryptedforage.createInstance({
                    name: 'storage2',
                    // We need a small value here
                    // otherwise local PhantomJS test
                    // will fail with SECURITY_ERR.
                    // TravisCI seem to work fine though.
                    size: 1024,
                    storeName: 'storagename2'
                });

                // Same name, but different storeName since this has been
                // malfunctioning before w/ IndexedDB.
                cryptedforage3 = cryptedforage.createInstance({
                    name: 'storage2',
                    // We need a small value here
                    // otherwise local PhantomJS test
                    // will fail with SECURITY_ERR.
                    // TravisCI seem to work fine though.
                    size: 1024,
                    storeName: 'storagename3'
                });

                Promise.all([
                    cryptedforage.setDriver(driverName),
                    cryptedforage2.setDriver(driverName),
                    cryptedforage3.setDriver(driverName)
                ]).then(function() {
                    done();
                });
            });
        });

        beforeEach(function(done) {
            Promise.all([
                cryptedforage.clear(),
                cryptedforage2.clear(),
                cryptedforage3.clear()
            ]).then(function() {
                done();
            });
        });

        it('is not be able to access values of other instances', function(done) {
            Promise.all([
                cryptedforage.setItem('key1', 'value1a'),
                cryptedforage2.setItem('key2', 'value2a'),
                cryptedforage3.setItem('key3', 'value3a')
            ])
                .then(function() {
                    return Promise.all([
                        cryptedforage.getItem('key2').then(function(value) {
                            expect(value).to.be(null);
                        }),
                        cryptedforage2.getItem('key1').then(function(value) {
                            expect(value).to.be(null);
                        }),
                        cryptedforage2.getItem('key3').then(function(value) {
                            expect(value).to.be(null);
                        }),
                        cryptedforage3.getItem('key2').then(function(value) {
                            expect(value).to.be(null);
                        })
                    ]);
                })
                .then(
                    function() {
                        done();
                    },
                    function(errors) {
                        done(new Error(errors));
                    }
                );
        });

        it('retrieves the proper value when using the same key with other instances', function(done) {
            Promise.all([
                cryptedforage.setItem('key', 'value1'),
                cryptedforage2.setItem('key', 'value2'),
                cryptedforage3.setItem('key', 'value3')
            ])
                .then(function() {
                    return Promise.all([
                        cryptedforage.getItem('key').then(function(value) {
                            expect(value).to.be('value1');
                        }),
                        cryptedforage2.getItem('key').then(function(value) {
                            expect(value).to.be('value2');
                        }),
                        cryptedforage3.getItem('key').then(function(value) {
                            expect(value).to.be('value3');
                        })
                    ]);
                })
                .then(
                    function() {
                        done();
                    },
                    function(errors) {
                        done(new Error(errors));
                    }
                );
        });
    });

    // Refers to issue #492 - https://github.com/mozilla/cryptedForage/issues/492
    describe(
        driverName + ' driver multiple instances (concurrent on same database)',
        function() {
            'use strict';

            this.timeout(30000);

            before(function() {
                return Promise.all([
                    prepareStorage('storage3'),
                    prepareStorage('commonStorage'),
                    prepareStorage('commonStorage2'),
                    prepareStorage('commonStorage3')
                ]);
            });

            it('chains operation on multiple stores', function() {
                var cryptedforage1 = cryptedforage.createInstance({
                    name: 'storage3',
                    storeName: 'store1',
                    size: 1024
                });

                var cryptedforage2 = cryptedforage.createInstance({
                    name: 'storage3',
                    storeName: 'store2',
                    size: 1024
                });

                var cryptedforage3 = cryptedforage.createInstance({
                    name: 'storage3',
                    storeName: 'store3',
                    size: 1024
                });

                var promise1 = cryptedforage1
                    .setItem('key', 'value1')
                    .then(function() {
                        return cryptedforage1.getItem('key');
                    })
                    .then(function(value) {
                        expect(value).to.be('value1');
                    });

                var promise2 = cryptedforage2
                    .setItem('key', 'value2')
                    .then(function() {
                        return cryptedforage2.getItem('key');
                    })
                    .then(function(value) {
                        expect(value).to.be('value2');
                    });

                var promise3 = cryptedforage3
                    .setItem('key', 'value3')
                    .then(function() {
                        return cryptedforage3.getItem('key');
                    })
                    .then(function(value) {
                        expect(value).to.be('value3');
                    });

                return Promise.all([promise1, promise2, promise3]);
            });

            it('can create multiple instances of the same store', function() {
                var cryptedforage1;
                var cryptedforage2;
                var cryptedforage3;

                Promise.resolve()
                    .then(function() {
                        cryptedforage1 = cryptedforage.createInstance({
                            name: 'commonStorage',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage1.ready();
                    })
                    .then(function() {
                        cryptedforage2 = cryptedforage.createInstance({
                            name: 'commonStorage',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage2.ready();
                    })
                    .then(function() {
                        cryptedforage3 = cryptedforage.createInstance({
                            name: 'commonStorage',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage3.ready();
                    })
                    .then(function() {
                        return Promise.resolve()
                            .then(function() {
                                return cryptedforage1
                                    .setItem('key1', 'value1')
                                    .then(function() {
                                        return cryptedforage1.getItem('key1');
                                    })
                                    .then(function(value) {
                                        expect(value).to.be('value1');
                                    });
                            })
                            .then(function() {
                                return cryptedforage2
                                    .setItem('key2', 'value2')
                                    .then(function() {
                                        return cryptedforage2.getItem('key2');
                                    })
                                    .then(function(value) {
                                        expect(value).to.be('value2');
                                    });
                            })
                            .then(function() {
                                return cryptedforage3
                                    .setItem('key3', 'value3')
                                    .then(function() {
                                        return cryptedforage3.getItem('key3');
                                    })
                                    .then(function(value) {
                                        expect(value).to.be('value3');
                                    });
                            });
                    });
            });

            it('can create multiple instances of the same store and do concurrent operations', function() {
                var cryptedforage1;
                var cryptedforage2;
                var cryptedforage3;
                var cryptedforage3b;

                Promise.resolve()
                    .then(function() {
                        cryptedforage1 = cryptedforage.createInstance({
                            name: 'commonStorage2',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage1.ready();
                    })
                    .then(function() {
                        cryptedforage2 = cryptedforage.createInstance({
                            name: 'commonStorage2',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage2.ready();
                    })
                    .then(function() {
                        cryptedforage3 = cryptedforage.createInstance({
                            name: 'commonStorage2',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage3.ready();
                    })
                    .then(function() {
                        cryptedforage3b = cryptedforage.createInstance({
                            name: 'commonStorage2',
                            storeName: 'commonStore',
                            size: 1024
                        });
                        return cryptedforage3b.ready();
                    })
                    .then(function() {
                        var promise1 = cryptedforage1
                            .setItem('key1', 'value1')
                            .then(function() {
                                return cryptedforage1.getItem('key1');
                            })
                            .then(function(value) {
                                expect(value).to.be('value1');
                            });

                        var promise2 = cryptedforage2
                            .setItem('key2', 'value2')
                            .then(function() {
                                return cryptedforage2.getItem('key2');
                            })
                            .then(function(value) {
                                expect(value).to.be('value2');
                            });

                        var promise3 = cryptedforage3
                            .setItem('key3', 'value3')
                            .then(function() {
                                return cryptedforage3.getItem('key3');
                            })
                            .then(function(value) {
                                expect(value).to.be('value3');
                            });

                        var promise4 = cryptedforage3b
                            .setItem('key3', 'value3')
                            .then(function() {
                                return cryptedforage3.getItem('key3');
                            })
                            .then(function(value) {
                                expect(value).to.be('value3');
                            });

                        return Promise.all([
                            promise1,
                            promise2,
                            promise3,
                            promise4
                        ]);
                    });
            });

            it('can create multiple instances of the same store concurrently', function() {
                var cryptedforage1 = cryptedforage.createInstance({
                    name: 'commonStorage3',
                    storeName: 'commonStore',
                    size: 1024
                });

                var cryptedforage2 = cryptedforage.createInstance({
                    name: 'commonStorage3',
                    storeName: 'commonStore',
                    size: 1024
                });

                var cryptedforage3 = cryptedforage.createInstance({
                    name: 'commonStorage3',
                    storeName: 'commonStore',
                    size: 1024
                });

                var cryptedforage3b = cryptedforage.createInstance({
                    name: 'commonStorage3',
                    storeName: 'commonStore',
                    size: 1024
                });

                var promise1 = cryptedforage1
                    .setItem('key1', 'value1')
                    .then(function() {
                        return cryptedforage1.getItem('key1');
                    })
                    .then(function(value) {
                        expect(value).to.be('value1');
                    });

                var promise2 = cryptedforage2
                    .setItem('key2', 'value2')
                    .then(function() {
                        return cryptedforage2.getItem('key2');
                    })
                    .then(function(value) {
                        expect(value).to.be('value2');
                    });

                var promise3 = cryptedforage3
                    .setItem('key3', 'value3')
                    .then(function() {
                        return cryptedforage3.getItem('key3');
                    })
                    .then(function(value) {
                        expect(value).to.be('value3');
                    });

                var promise4 = cryptedforage3b
                    .setItem('key3', 'value3')
                    .then(function() {
                        return cryptedforage3.getItem('key3');
                    })
                    .then(function(value) {
                        expect(value).to.be('value3');
                    });

                return Promise.all([promise1, promise2, promise3, promise4]);
            });
        }
    );

    describe(driverName + ' driver', function() {
        'use strict';

        var driverPreferedOrder;

        before(function() {
            // add some unsupported drivers before
            // and after the target driver
            driverPreferedOrder = ['I am a not supported driver'];

            if (!cryptedforage.supports(cryptedforage.WEBSQL)) {
                driverPreferedOrder.push(cryptedforage.WEBSQL);
            }
            if (!cryptedforage.supports(cryptedforage.INDEXEDDB)) {
                driverPreferedOrder.push(cryptedforage.INDEXEDDB);
            }
            if (!cryptedforage.supports(cryptedforage.LOCALSTORAGE)) {
                driverPreferedOrder.push(cryptedforage.localStorage);
            }

            driverPreferedOrder.push(driverName);

            driverPreferedOrder.push('I am another not supported driver');
        });

        it('is used according to setDriver preference order', function(done) {
            cryptedforage.setDriver(driverPreferedOrder).then(function() {
                expect(cryptedforage.driver()).to.be(driverName);
                done();
            });
        });
    });

    describe(
        driverName + ' driver when the callback throws an Error',
        function() {
            'use strict';

            var testObj = {
                throwFunc: function() {
                    testObj.throwFuncCalls++;
                    throw new Error('Thrown test error');
                },
                throwFuncCalls: 0
            };

            beforeEach(function(done) {
                testObj.throwFuncCalls = 0;
                done();
            });

            it('resolves the promise of getItem()', function(done) {
                cryptedforage
                    .getItem('key', testObj.throwFunc)
                    .then(function() {
                        expect(testObj.throwFuncCalls).to.be(1);
                        done();
                    });
            });

            it('resolves the promise of setItem()', function(done) {
                cryptedforage
                    .setItem('key', 'test', testObj.throwFunc)
                    .then(function() {
                        expect(testObj.throwFuncCalls).to.be(1);
                        done();
                    });
            });

            it('resolves the promise of clear()', function(done) {
                cryptedforage.clear(testObj.throwFunc).then(function() {
                    expect(testObj.throwFuncCalls).to.be(1);
                    done();
                });
            });

            it('resolves the promise of length()', function(done) {
                cryptedforage.length(testObj.throwFunc).then(function() {
                    expect(testObj.throwFuncCalls).to.be(1);
                    done();
                });
            });

            it('resolves the promise of removeItem()', function(done) {
                cryptedforage
                    .removeItem('key', testObj.throwFunc)
                    .then(function() {
                        expect(testObj.throwFuncCalls).to.be(1);
                        done();
                    });
            });

            it('resolves the promise of key()', function(done) {
                cryptedforage.key('key', testObj.throwFunc).then(function() {
                    expect(testObj.throwFuncCalls).to.be(1);
                    done();
                });
            });

            it('resolves the promise of keys()', function(done) {
                cryptedforage.keys(testObj.throwFunc).then(function() {
                    expect(testObj.throwFuncCalls).to.be(1);
                    done();
                });
            });
        }
    );

    describe(driverName + ' driver when ready() gets rejected', function() {
        'use strict';

        this.timeout(30000);

        var _oldReady;

        beforeEach(function(done) {
            _oldReady = cryptedforage.ready;
            cryptedforage.ready = function() {
                return Promise.reject();
            };
            done();
        });

        afterEach(function(done) {
            cryptedforage.ready = _oldReady;
            _oldReady = null;
            done();
        });

        driverApiMethods.forEach(function(methodName) {
            it('rejects ' + methodName + '() promise', function(done) {
                cryptedforage[methodName]().then(null, function(/*err*/) {
                    done();
                });
            });
        });
    });
});

DRIVERS.forEach(function(driverName) {
    describe(driverName + ' driver instance', function() {
        it('creates a new instance and sets the driver', function(done) {
            var cryptedforage2 = cryptedforage.createInstance({
                name: 'storage2',
                driver: driverName,
                // We need a small value here
                // otherwise local PhantomJS test
                // will fail with SECURITY_ERR.
                // TravisCI seem to work fine though.
                size: 1024,
                storeName: 'storagename2'
            });

            // since config actually uses setDriver which is async,
            // and since driver() and supports() are not defered (are sync),
            // we have to wait till an async method returns
            cryptedforage2.length().then(
                function() {
                    expect(cryptedforage2.driver()).to.be(driverName);
                    done();
                },
                function() {
                    expect(cryptedforage2.driver()).to.be(null);
                    done();
                }
            );
        });
    });
});

SUPPORTED_DRIVERS.forEach(function(driverName) {
    describe(driverName + ' driver dropInstance', function() {
        this.timeout(30000);

        function setCommonOpts(opts) {
            opts.driver = driverName;
            opts.size = 1024;
            return opts;
        }

        var dropStoreDbName = 'dropStoreDb';

        var nodropInstance;
        var nodropInstanceOptions = setCommonOpts({
            name: dropStoreDbName,
            storeName: 'nodropStore'
        });

        var dropStoreInstance1;
        var dropStoreInstance1Options = setCommonOpts({
            name: dropStoreDbName,
            storeName: 'dropStore'
        });

        var dropStoreInstance2;
        var dropStoreInstance2Options = setCommonOpts({
            name: dropStoreDbName,
            storeName: 'dropStore2'
        });

        var dropStoreInstance3;
        var dropStoreInstance3Options = setCommonOpts({
            name: dropStoreDbName,
            storeName: 'dropStore3'
        });

        var dropDbInstance;
        var dropDbInstanceOptions = setCommonOpts({
            name: 'dropDb',
            storeName: 'dropStore'
        });

        var dropDb2Instance;
        var dropDb2InstanceOptions = setCommonOpts({
            name: 'dropDb2',
            storeName: 'dropStore'
        });

        var dropDb3name = 'dropDb3';

        var dropDb3Instance1;
        var dropDb3Instance1Options = setCommonOpts({
            name: dropDb3name,
            storeName: 'dropStore1'
        });

        var dropDb3Instance2;
        var dropDb3Instance2Options = setCommonOpts({
            name: dropDb3name,
            storeName: 'dropStore2'
        });

        var dropDb3Instance3;
        var dropDb3Instance3Options = setCommonOpts({
            name: dropDb3name,
            storeName: 'dropStore3'
        });

        before(function() {
            nodropInstance = cryptedforage.createInstance(
                nodropInstanceOptions
            );
            dropStoreInstance1 = cryptedforage.createInstance(
                dropStoreInstance1Options
            );
            dropStoreInstance2 = cryptedforage.createInstance(
                dropStoreInstance2Options
            );
            dropStoreInstance3 = cryptedforage.createInstance(
                dropStoreInstance3Options
            );
            dropDbInstance = cryptedforage.createInstance(
                dropDbInstanceOptions
            );
            dropDb2Instance = cryptedforage.createInstance(
                dropDb2InstanceOptions
            );
            dropDb3Instance1 = cryptedforage.createInstance(
                dropDb3Instance1Options
            );
            dropDb3Instance2 = cryptedforage.createInstance(
                dropDb3Instance2Options
            );
            dropDb3Instance3 = cryptedforage.createInstance(
                dropDb3Instance3Options
            );
            return Promise.resolve()
                .then(function() {
                    return nodropInstance.setItem('key1', 'value0');
                })
                .then(function() {
                    return dropStoreInstance1.setItem('key1', 'value1');
                })
                .then(function() {
                    return dropStoreInstance2.setItem('key1', 'value2');
                })
                .then(function() {
                    return dropStoreInstance3.setItem('key1', 'value3');
                })
                .then(function() {
                    return dropDbInstance.setItem('key1', 'value3');
                })
                .then(function() {
                    return dropDb2Instance.setItem('key1', 'value3');
                })
                .then(function() {
                    return dropDb3Instance1.setItem('key1', 'value1');
                })
                .then(function() {
                    return dropDb3Instance2.setItem('key1', 'value2');
                })
                .then(function() {
                    return dropDb3Instance3.setItem('key1', 'value3');
                });
        });

        function expectStoreToNotExistAsync(options) {
            return new Promise(function(resolve, reject) {
                if (driverName === cryptedforage.INDEXEDDB) {
                    var req = indexedDB.open(options.name);
                    req.onsuccess = function() {
                        var db = req.result;
                        if (!db) {
                            reject();
                            return;
                        }
                        expect(
                            db.objectStoreNames.contains(options.storeName)
                        ).to.be(false);
                        db.close();
                        resolve();
                    };
                    req.onerror = req.onblocked = reject;
                } else if (driverName === cryptedforage.WEBSQL) {
                    var db = openDatabase(options.name, '', '', 0);
                    db.transaction(function(t) {
                        t.executeSql(
                            "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
                            [options.storeName],
                            function(t, results) {
                                expect(results.rows.length).to.be(0);
                                resolve();
                            },
                            reject
                        );
                    }, reject);
                } else if (driverName === cryptedforage.LOCALSTORAGE) {
                    var keyPrefix = (function _getKeyPrefix(
                        options,
                        defaultConfig
                    ) {
                        var keyPrefix = options.name + '/';

                        if (options.storeName !== defaultConfig.storeName) {
                            keyPrefix += options.storeName + '/';
                        }
                        return keyPrefix;
                    })(options, {
                        name: 'cryptedforage',
                        storeName: 'keyvaluepairs'
                    });

                    var foundLocalStorageKey = false;
                    for (
                        var i = 0, length = localStorage.length;
                        i < length;
                        i++
                    ) {
                        if (localStorage.key(i).indexOf(keyPrefix) === 0) {
                            foundLocalStorageKey = true;
                            break;
                        }
                    }
                    expect(foundLocalStorageKey).to.be(false);
                    resolve();
                } else {
                    throw new Error('Not Implemented Exception');
                }
            });
        }

        it('drops the current instance without affecting the rest', function() {
            return dropStoreInstance1
                .dropInstance()
                .then(function() {
                    return nodropInstance.getItem('key1');
                })
                .then(function(value) {
                    expect(value).to.be('value0');
                });
        });

        it('can recreate and set values to previously dropped instances', function() {
            return dropStoreInstance1
                .dropInstance()
                .then(function() {
                    return dropStoreInstance1.getItem('key1');
                })
                .then(function(value) {
                    expect(value).to.be(null);
                    return dropStoreInstance1.length();
                })
                .then(function(length) {
                    expect(length).to.be(0);
                })
                .then(function() {
                    return dropStoreInstance1.setItem('key1', 'newvalue2');
                })
                .then(function() {
                    return dropStoreInstance1.getItem('key1');
                })
                .then(function(value) {
                    expect(value).to.be('newvalue2');
                });
        });

        it('drops an other instance without affecting the rest', function() {
            var opts = {
                name: dropStoreInstance2Options.name,
                storeName: dropStoreInstance2Options.storeName
            };
            return nodropInstance
                .dropInstance(opts)
                .then(function() {
                    return nodropInstance.getItem('key1');
                })
                .then(function(value) {
                    expect(value).to.be('value0');
                });
        });

        it('the dropped instance is completely removed', function() {
            var opts = {
                name: dropStoreInstance3Options.name,
                storeName: dropStoreInstance3Options.storeName
            };
            return dropStoreInstance3.dropInstance().then(function() {
                return expectStoreToNotExistAsync(opts);
            });
        });

        it('resolves when trying to drop a store that does not exit', function() {
            var opts = {
                name: dropStoreInstance3Options.name,
                storeName: 'NotExistingStore' + Date.now()
            };
            return dropStoreInstance3.dropInstance(opts);
        });

        function expectDBToNotExistAsync(options) {
            return new Promise(function(resolve, reject) {
                if (driverName === cryptedforage.INDEXEDDB) {
                    var req = indexedDB.open(options.name);
                    req.onsuccess = function() {
                        var db = req.result;
                        if (!db) {
                            reject();
                            return;
                        }
                        expect(db.objectStoreNames.length).to.be(0);
                        db.close();
                        resolve();
                    };
                    req.onerror = req.onblocked = reject;
                } else if (driverName === cryptedforage.WEBSQL) {
                    var db = openDatabase(options.name, '', '', 0);
                    db.transaction(function(t) {
                        t.executeSql(
                            "SELECT name FROM sqlite_master WHERE type='table'",
                            [],
                            function(t, results) {
                                var stores = Array.prototype.filter.call(
                                    results.rows,
                                    function(obj) {
                                        return (
                                            obj &&
                                            obj.name &&
                                            obj.name.indexOf('__') !== 0
                                        );
                                    }
                                );
                                expect(stores.length).to.be(0);
                                resolve();
                            },
                            reject
                        );
                    }, reject);
                } else if (driverName === cryptedforage.LOCALSTORAGE) {
                    var keyPrefix = (function _getKeyPrefix(options) {
                        return options.name + '/';
                    })(options);

                    var foundLocalStorageKey = false;
                    for (
                        var i = 0, length = localStorage.length;
                        i < length;
                        i++
                    ) {
                        if (localStorage.key(i).indexOf(keyPrefix) === 0) {
                            foundLocalStorageKey = true;
                            break;
                        }
                    }
                    expect(foundLocalStorageKey).to.be(false);
                    resolve();
                } else {
                    throw new Error('Not Implemented Exception');
                }
            });
        }

        it('the dropped "DB" can be recreated', function() {
            var opts = {
                name: dropDbInstanceOptions.name
            };
            return dropDbInstance
                .dropInstance(opts)
                .then(function() {
                    return dropDbInstance.getItem('key1');
                })
                .then(function(value) {
                    expect(value).to.be(null);
                });
        });

        it('the dropped "DB" is completely removed', function() {
            var opts = {
                name: dropDb2InstanceOptions.name
            };
            return dropDb2Instance.dropInstance(opts).then(function() {
                return expectDBToNotExistAsync(opts);
            });
        });

        it('resolves when trying to drop a store of a "DB" that does not exit', function() {
            var opts = {
                name: 'NotExistingDB' + Date.now(),
                storeName: 'NotExistingStore' + Date.now()
            };
            return dropStoreInstance3.dropInstance(opts);
        });

        it('resolves when trying to drop a "DB" that does not exist', function() {
            var opts = {
                name: 'NotExistingDB' + Date.now()
            };
            return dropStoreInstance3.dropInstance(opts);
        });

        it('drops a "DB" that we previously dropped a store', function() {
            var opts = {
                name: dropStoreInstance3Options.name
            };
            return dropStoreInstance3.dropInstance(opts).then(function() {
                return expectDBToNotExistAsync(opts);
            });
        });

        it('drops a "DB" after dropping all its stores', function() {
            var opts = {
                name: dropDb3name
            };
            // Before trying to drop a different store/DB
            // make sure that the instance that you will use
            // is configured to use the same driver as well.
            return Promise.resolve()
                .then(function() {
                    return dropDb3Instance1.dropInstance({
                        name: dropDb3name,
                        storeName: dropDb3Instance1Options.storeName
                    });
                })
                .then(function() {
                    return dropDb3Instance1.dropInstance({
                        name: dropDb3name,
                        storeName: dropDb3Instance2Options.storeName
                    });
                })
                .then(function() {
                    return dropDb3Instance1.dropInstance({
                        name: dropDb3name,
                        storeName: dropDb3Instance3Options.storeName
                    });
                })
                .then(function() {
                    return dropDb3Instance1.dropInstance(opts);
                })
                .then(function() {
                    return expectDBToNotExistAsync(opts);
                });
        });
    });
});
