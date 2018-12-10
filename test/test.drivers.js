/* global beforeEach:true, describe:true, expect:true, it:true */
describe('Driver API', function() {
    'use strict';

    beforeEach(function(done) {
        if (cryptedforage.supports(cryptedforage.INDEXEDDB)) {
            cryptedforage.setDriver(cryptedforage.INDEXEDDB, function() {
                done();
            });
        } else if (cryptedforage.supports(cryptedforage.WEBSQL)) {
            cryptedforage.setDriver(cryptedforage.WEBSQL, function() {
                done();
            });
        } else {
            done();
        }
    });

    if (
        (cryptedforage.supports(cryptedforage.INDEXEDDB) &&
            cryptedforage.driver() === cryptedforage.INDEXEDDB) ||
        (cryptedforage.supports(cryptedforage.WEBSQL) &&
            cryptedforage.driver() === cryptedforage.WEBSQL)
    ) {
        it(
            'can change to localStorage from ' +
                cryptedforage.driver() +
                ' [callback]',
            function(done) {
                var previousDriver = cryptedforage.driver();

                cryptedforage.setDriver(cryptedforage.LOCALSTORAGE, function() {
                    expect(cryptedforage.driver()).to.be(
                        cryptedforage.LOCALSTORAGE
                    );
                    expect(cryptedforage.driver()).to.not.be(previousDriver);
                    done();
                });
            }
        );
        it(
            'can change to localStorage from ' +
                cryptedforage.driver() +
                ' [promise]',
            function(done) {
                var previousDriver = cryptedforage.driver();

                cryptedforage
                    .setDriver(cryptedforage.LOCALSTORAGE)
                    .then(function() {
                        expect(cryptedforage.driver()).to.be(
                            cryptedforage.LOCALSTORAGE
                        );
                        expect(cryptedforage.driver()).to.not.be(
                            previousDriver
                        );
                        done();
                    });
            }
        );
    }

    if (!cryptedforage.supports(cryptedforage.INDEXEDDB)) {
        it("can't use unsupported IndexedDB [callback]", function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.not.be(cryptedforage.INDEXEDDB);

            // These should be rejected in component builds but aren't.
            // TODO: Look into why.
            cryptedforage.setDriver(cryptedforage.INDEXEDDB, null, function() {
                expect(cryptedforage.driver()).to.be(previousDriver);
                done();
            });
        });
        it("can't use unsupported IndexedDB [promise]", function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.not.be(cryptedforage.INDEXEDDB);

            // These should be rejected in component builds but aren't.
            // TODO: Look into why.
            cryptedforage
                .setDriver(cryptedforage.INDEXEDDB)
                .then(null, function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                });
        });
    } else {
        it('can set already active IndexedDB [callback]', function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.be(cryptedforage.INDEXEDDB);

            cryptedforage.setDriver(cryptedforage.INDEXEDDB, function() {
                expect(cryptedforage.driver()).to.be(previousDriver);
                done();
            });
        });
        it('can set already active IndexedDB [promise]', function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.be(cryptedforage.INDEXEDDB);

            cryptedforage.setDriver(cryptedforage.INDEXEDDB).then(function() {
                expect(cryptedforage.driver()).to.be(previousDriver);
                done();
            });
        });
    }

    if (!cryptedforage.supports(cryptedforage.LOCALSTORAGE)) {
        it("can't use unsupported localStorage [callback]", function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.not.be(cryptedforage.LOCALSTORAGE);

            cryptedforage.setDriver(
                cryptedforage.LOCALSTORAGE,
                null,
                function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                }
            );
        });
        it("can't use unsupported localStorage [promise]", function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.not.be(cryptedforage.LOCALSTORAGE);

            cryptedforage
                .setDriver(cryptedforage.LOCALSTORAGE)
                .then(null, function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                });
        });
    } else if (
        !cryptedforage.supports(cryptedforage.INDEXEDDB) &&
        !cryptedforage.supports(cryptedforage.WEBSQL)
    ) {
        it('can set already active localStorage [callback]', function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.be(cryptedforage.LOCALSTORAGE);

            cryptedforage.setDriver(cryptedforage.LOCALSTORAGE, function() {
                expect(cryptedforage.driver()).to.be(previousDriver);
                done();
            });
        });
        it('can set already active localStorage [promise]', function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.be(cryptedforage.LOCALSTORAGE);

            cryptedforage
                .setDriver(cryptedforage.LOCALSTORAGE)
                .then(function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                });
        });
    }

    if (!cryptedforage.supports(cryptedforage.WEBSQL)) {
        it("can't use unsupported WebSQL [callback]", function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.not.be(cryptedforage.WEBSQL);

            cryptedforage.setDriver(cryptedforage.WEBSQL, null, function() {
                expect(cryptedforage.driver()).to.be(previousDriver);
                done();
            });
        });
        it("can't use unsupported WebSQL [promise]", function(done) {
            var previousDriver = cryptedforage.driver();
            expect(previousDriver).to.not.be(cryptedforage.WEBSQL);

            cryptedforage
                .setDriver(cryptedforage.WEBSQL)
                .then(null, function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                });
        });
    } else {
        it('can set already active WebSQL [callback]', function(done) {
            cryptedforage.setDriver(cryptedforage.WEBSQL, function() {
                var previousDriver = cryptedforage.driver();
                expect(previousDriver).to.be(cryptedforage.WEBSQL);

                cryptedforage.setDriver(cryptedforage.WEBSQL, function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                });
            });
        });
        it('can set already active WebSQL [promise]', function(done) {
            cryptedforage.setDriver(cryptedforage.WEBSQL).then(function() {
                var previousDriver = cryptedforage.driver();
                expect(previousDriver).to.be(cryptedforage.WEBSQL);

                cryptedforage.setDriver(cryptedforage.WEBSQL).then(function() {
                    expect(cryptedforage.driver()).to.be(previousDriver);
                    done();
                });
            });
        });
    }
});
