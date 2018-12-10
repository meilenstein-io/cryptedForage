/* global before:true, beforeEach:true, describe:true, expect:true, it:true, Modernizr:true */
var DRIVERS = [
    cryptedforage.INDEXEDDB,
    cryptedforage.LOCALSTORAGE,
    cryptedforage.WEBSQL
];

DRIVERS.forEach(function(driverName) {
    if (
        (!cryptedforage.supports(cryptedforage.INDEXEDDB) &&
            driverName === cryptedforage.INDEXEDDB) ||
        (!cryptedforage.supports(cryptedforage.LOCALSTORAGE) &&
            driverName === cryptedforage.LOCALSTORAGE) ||
        (!cryptedforage.supports(cryptedforage.WEBSQL) &&
            driverName === cryptedforage.WEBSQL)
    ) {
        // Browser doesn't support this storage library, so we exit the API
        // tests.
        return;
    }

    describe('Web Worker support in ' + driverName, function() {
        'use strict';

        before(function(done) {
            cryptedforage.setDriver(driverName).then(done);
        });

        beforeEach(function(done) {
            cryptedforage.clear(done);
        });

        if (!Modernizr.webworkers) {
            it.skip("doesn't have web worker support");
            return;
        }

        if (
            driverName === cryptedforage.LOCALSTORAGE ||
            driverName === cryptedforage.WEBSQL
        ) {
            it.skip(driverName + ' is not supported in web workers');
            return;
        }

        it('saves data', function(done) {
            var webWorker = new Worker('/test/webworker-client.js');

            webWorker.addEventListener('message', function(e) {
                var body = e.data.body;

                window.console.log(body);
                expect(body).to.be('I have been set');
                done();
            });

            webWorker.addEventListener('error', function(e) {
                window.console.log(e);
            });

            webWorker.postMessage({
                driver: driverName,
                value: 'I have been set'
            });
        });
    });
});
