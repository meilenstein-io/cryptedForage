/* global beforeEach:true */
this.mocha.setup('bdd');

beforeEach(function(done) {
    var previousDriver = cryptedforage.driver();

    function rerequirecryptedforage() {
        // The API method stubs inserted by callWhenReady must be tested before
        // they are replaced by the driver, which happens as soon as it loads.
        //
        // To ensure that they work when the drivers are loaded asynchronously,
        // we run the entire test suite (except for config tests), but undefine
        // the cryptedforage module and force it to reload before each test, so that
        // it will be initialized again.
        //
        // This ensures that the synchronous parts of cryptedforage initialization
        // and the API calls in the tests occur first in every test, such that the
        // callWhenReady API method stubs are called before RequireJS
        // asynchronously loads the drivers that replace them.
        require.undef('cryptedforage');
        require(['cryptedforage'], function(cryptedforage) {
            cryptedforage.setDriver(previousDriver);
            window.cryptedforage = cryptedforage;
            done();
        });
    }

    cryptedforage.ready().then(
        function() {
            previousDriver = cryptedforage.driver();
            rerequirecryptedforage();
        },
        function() {
            rerequirecryptedforage();
        }
    );
});
