/* global beforeEach:true, describe:true, expect:true, it:true */
describe('When Driver Fails to Initialize', function() {
    'use strict';

    var FAULTYDRIVERS = [
        cryptedforage.INDEXEDDB,
        cryptedforage.WEBSQL,
        cryptedforage.LOCALSTORAGE
    ]
        .filter(cryptedforage.supports)
        .filter(function(driverName) {
            // FF doesn't allow you to override `localStorage.setItem`
            // so if the faulty driver setup didn't succeed
            // then skip the localStorage tests
            return !(
                driverName === cryptedforage.LOCALSTORAGE &&
                localStorage.setItem.toString().indexOf('[native code]') >= 0
            );
        });

    FAULTYDRIVERS.forEach(function(driverName) {
        describe(driverName, function() {
            beforeEach(function() {
                if (driverName === cryptedforage.LOCALSTORAGE) {
                    localStorage.clear();
                }
            });

            it('fails to setDriver ' + driverName + ' [callback]', function(
                done
            ) {
                cryptedforage.setDriver(driverName, function() {
                    cryptedforage.ready(function(err) {
                        expect(err).to.be.an(Error);
                        expect(err.message).to.be(
                            'No available storage method found.'
                        );
                        done();
                    });
                });
            });

            it('fails to setDriver ' + driverName + ' [promise]', function(
                done
            ) {
                cryptedforage
                    .setDriver(driverName)
                    .then(function() {
                        return cryptedforage.ready();
                    })
                    .then(null, function(err) {
                        expect(err).to.be.an(Error);
                        expect(err.message).to.be(
                            'No available storage method found.'
                        );
                        done();
                    });
            });
        });
    });
});
