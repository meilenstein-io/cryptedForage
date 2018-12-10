/* global before:true, beforeEach:true, describe:true, expect:true, it:true */
describe('Config API', function() {
    'use strict';

    var DRIVERS = [
        cryptedforage.INDEXEDDB,
        cryptedforage.LOCALSTORAGE,
        cryptedforage.WEBSQL
    ];
    var supportedDrivers = [];

    before(function() {
        this.defaultConfig = cryptedforage.config();

        supportedDrivers = [];
        for (var i = 0; i <= DRIVERS.length; i++) {
            if (cryptedforage.supports(DRIVERS[i])) {
                supportedDrivers.push(DRIVERS[i]);
            }
        }
    });

    // Reset cryptedForage before each test so we can call `config()` without
    // errors.
    beforeEach(function() {
        cryptedforage._ready = null;
        cryptedforage.config(this.defaultConfig);
    });

    it('returns the default values', function(done) {
        expect(cryptedforage.config('description')).to.be('');
        expect(cryptedforage.config('name')).to.be('cryptedforage');
        expect(cryptedforage.config('size')).to.be(4980736);
        expect(cryptedforage.config('storeName')).to.be('keyvaluepairs');
        expect(cryptedforage.config('version')).to.be(1.0);
        cryptedforage.ready(function() {
            expect(cryptedforage.config('driver')).to.be(
                cryptedforage.driver()
            );
            done();
        });
    });

    it('returns error if API call was already made', function(done) {
        cryptedforage.length(function() {
            var configResult = cryptedforage.config({
                description: '123',
                driver: 'I a not set driver',
                name: 'My Cool App',
                storeName: 'myStoreName',
                version: 2.0
            });

            var error =
                "Error: Can't call config() after cryptedforage " +
                'has been used.';

            expect(configResult).to.not.be(true);
            expect(configResult.toString()).to.be(error);

            // Expect the config values to be as they were before.
            expect(cryptedforage.config('description')).to.not.be('123');
            expect(cryptedforage.config('description')).to.be('');
            expect(cryptedforage.config('driver')).to.be(
                cryptedforage.driver()
            );
            expect(cryptedforage.config('driver')).to.not.be(
                'I a not set driver'
            );
            expect(cryptedforage.config('name')).to.be('cryptedforage');
            expect(cryptedforage.config('name')).to.not.be('My Cool App');
            expect(cryptedforage.config('size')).to.be(4980736);
            expect(cryptedforage.config('storeName')).to.be('keyvaluepairs');
            expect(cryptedforage.config('version')).to.be(1.0);

            done();
        });
    });

    it('sets new values and returns them properly', function(done) {
        var secondSupportedDriver =
            supportedDrivers.length >= 2 ? supportedDrivers[1] : null;

        cryptedforage.config({
            description: 'The offline datastore for my cool app',
            driver: secondSupportedDriver,
            name: 'My Cool App',
            storeName: 'myStoreName',
            version: 2.0
        });

        expect(cryptedforage.config('description')).to.not.be('');
        expect(cryptedforage.config('description')).to.be(
            'The offline datastore for my cool app'
        );
        expect(cryptedforage.config('driver')).to.be(secondSupportedDriver);
        expect(cryptedforage.config('name')).to.be('My Cool App');
        expect(cryptedforage.config('size')).to.be(4980736);
        expect(cryptedforage.config('storeName')).to.be('myStoreName');
        expect(cryptedforage.config('version')).to.be(2.0);

        cryptedforage.ready(function() {
            if (supportedDrivers.length >= 2) {
                expect(cryptedforage.config('driver')).to.be(
                    secondSupportedDriver
                );
            } else {
                expect(cryptedforage.config('driver')).to.be(
                    supportedDrivers[0]
                );
            }
            done();
        });
    });

    if (supportedDrivers.length >= 2) {
        it('sets new driver using preference order', function(done) {
            var otherSupportedDrivers = supportedDrivers.slice(1);

            var configResult = cryptedforage.config({
                driver: otherSupportedDrivers
            });

            expect(configResult).to.be.a(Promise);
            cryptedforage
                .ready(function() {
                    expect(cryptedforage.config('driver')).to.be(
                        otherSupportedDrivers[0]
                    );
                    return configResult;
                })
                .then(function() {
                    done();
                });
        });
    }

    it('it does not set an unsupported driver', function(done) {
        var oldDriver = cryptedforage.driver();
        var configResult = cryptedforage.config({
            driver: 'I am a not supported driver'
        });

        expect(configResult).to.be.a(Promise);
        cryptedforage
            .ready(function() {
                expect(cryptedforage.config('driver')).to.be(oldDriver);
                return configResult;
            })
            .catch(function(error) {
                expect(error).to.be.an(Error);
                expect(error.message).to.be(
                    'No available storage method found.'
                );
                done();
            });
    });

    it('it does not set an unsupported driver using preference order', function(done) {
        var oldDriver = cryptedforage.driver();
        cryptedforage.config({
            driver: [
                'I am a not supported driver',
                'I am a an other not supported driver'
            ]
        });

        cryptedforage.ready(function() {
            expect(cryptedforage.config('driver')).to.be(oldDriver);
            done();
        });
    });

    it('converts bad config values across drivers', function() {
        cryptedforage.config({
            name: 'My Cool App',
            // https://github.com/mozilla/cryptedForage/issues/247
            storeName: 'my store&name-v1',
            version: 2.0
        });

        expect(cryptedforage.config('name')).to.be('My Cool App');
        expect(cryptedforage.config('storeName')).to.be('my_store_name_v1');
        expect(cryptedforage.config('version')).to.be(2.0);
    });

    it('uses the config values in ' + cryptedforage.driver(), function(done) {
        cryptedforage.config({
            description: 'The offline datastore for my cool app',
            driver: cryptedforage.driver(),
            name: 'My Cool App',
            storeName: 'myStoreName',
            version: 2.0
        });

        cryptedforage.setItem('some key', 'some value').then(function(value) {
            if (cryptedforage.driver() === cryptedforage.INDEXEDDB) {
                var indexedDB =
                    indexedDB ||
                    window.indexedDB ||
                    window.webkitIndexedDB ||
                    window.mozIndexedDB ||
                    window.OIndexedDB ||
                    window.msIndexedDB;
                var req = indexedDB.open('My Cool App', 2.0);

                req.onsuccess = function() {
                    var dbValue = req.result
                        .transaction('myStoreName', 'readonly')
                        .objectStore('myStoreName')
                        .get('some key');
                    expect(dbValue).to.be(value);
                    done();
                };
            } else if (cryptedforage.driver() === cryptedforage.WEBSQL) {
                window
                    .openDatabase('My Cool App', String(2.0), '', 4980736)
                    .transaction(function(t) {
                        t.executeSql(
                            'SELECT * FROM myStoreName WHERE key = ? ' +
                                'LIMIT 1',
                            ['some key'],
                            function(t, results) {
                                var dbValue = JSON.parse(
                                    results.rows.item(0).value
                                );

                                expect(dbValue).to.be(value);
                                done();
                            }
                        );
                    });
            } else if (cryptedforage.driver() === cryptedforage.LOCALSTORAGE) {
                var dbValue = JSON.parse(
                    localStorage['My Cool App/myStoreName/some key']
                );

                expect(dbValue).to.be(value);
                done();
            }
        });
    });

    it("returns all values when config isn't passed arguments", function() {
        expect(cryptedforage.config()).to.be.an('object');
        expect(Object.keys(cryptedforage.config()).length).to.be(6);
    });

    // This may go away when https://github.com/mozilla/cryptedForage/issues/168
    // is fixed.
    it('maintains config values across setDriver calls', function(done) {
        cryptedforage.config({
            name: 'Mega Mozilla Dino'
        });

        cryptedforage
            .length()
            .then(function() {
                return cryptedforage.setDriver(cryptedforage.LOCALSTORAGE);
            })
            .then(function() {
                expect(cryptedforage.config('name')).to.be('Mega Mozilla Dino');
                done();
            });
    });

    it('returns error if database version is not a number', function(done) {
        var configResult = cryptedforage.config({
            version: '2.0'
        });

        var error = 'Error: Database version must be a number.';

        expect(configResult).to.not.be(true);
        expect(configResult.toString()).to.be(error);
        done();
    });
});
