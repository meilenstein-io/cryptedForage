/* global describe:true, expect:true, it:true, Modernizr:true */
describe('When No Drivers Are Available', function() {
    'use strict';

    var DRIVERS = [
        cryptedforage.INDEXEDDB,
        cryptedforage.LOCALSTORAGE,
        cryptedforage.WEBSQL
    ];

    it('agrees with Modernizr on storage drivers support', function() {
        expect(cryptedforage.supports(cryptedforage.INDEXEDDB)).to.be(false);
        expect(cryptedforage.supports(cryptedforage.INDEXEDDB)).to.be(
            Modernizr.indexeddb
        );

        expect(cryptedforage.supports(cryptedforage.LOCALSTORAGE)).to.be(false);
        expect(cryptedforage.supports(cryptedforage.LOCALSTORAGE)).to.be(
            Modernizr.localstorage
        );

        expect(cryptedforage.supports(cryptedforage.WEBSQL)).to.be(false);
        expect(cryptedforage.supports(cryptedforage.WEBSQL)).to.be(
            Modernizr.websqldatabase
        );
    });

    it('fails to load cryptedForage [callback]', function(done) {
        cryptedforage.ready(function(err) {
            expect(err).to.be.an(Error);
            expect(err.message).to.be('No available storage method found.');
            done();
        });
    });

    it('fails to load cryptedForage [promise]', function(done) {
        cryptedforage.ready().then(null, function(err) {
            expect(err).to.be.an(Error);
            expect(err.message).to.be('No available storage method found.');
            done();
        });
    });

    it('has no driver set', function(done) {
        cryptedforage.ready(function() {
            expect(cryptedforage.driver()).to.be(null);
            done();
        });
    });

    DRIVERS.forEach(function(driverName) {
        it('fails to setDriver ' + driverName + ' [callback]', function(done) {
            cryptedforage.setDriver(driverName, null, function(err) {
                expect(err).to.be.an(Error);
                expect(err.message).to.be('No available storage method found.');
                done();
            });
        });

        it('fails to setDriver ' + driverName + ' [promise]', function(done) {
            cryptedforage.setDriver(driverName).then(null, function(err) {
                expect(err).to.be.an(Error);
                expect(err.message).to.be('No available storage method found.');
                done();
            });
        });
    });

    it('fails to setDriver using array parameter [callback]', function(done) {
        cryptedforage.setDriver(DRIVERS, null, function(err) {
            expect(err).to.be.an(Error);
            expect(err.message).to.be('No available storage method found.');
            done();
        });
    });

    it('fails to setDriver using array parameter [promise]', function(done) {
        cryptedforage.setDriver(DRIVERS).then(null, function(err) {
            expect(err).to.be.an(Error);
            expect(err.message).to.be('No available storage method found.');
            done();
        });
    });
});
