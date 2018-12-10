/*globals importScripts:true, self:true */
importScripts('/dist/cryptedforage.js');

self.onmessage = function(messageEvent) {
    return cryptedforage
        .setDriver(messageEvent.data.driver)
        .then(function() {
            return cryptedforage.setItem(
                'service worker',
                messageEvent.data.value
            );
        })
        .then(function() {
            return cryptedforage.getItem('service worker');
        })
        .then(function(value) {
            messageEvent.ports[0].postMessage({
                body: value + ' using ' + cryptedforage.driver()
            });
        })
        .catch(function(error) {
            messageEvent.ports[0].postMessage({
                error: JSON.stringify(error),
                body: error,
                fail: true
            });
        });
};

self.oninstall = function(event) {
    event.waitUntil(
        cryptedforage
            .setItem('service worker registration', 'serviceworker present')
            .then(function(value) {
                console.log(value);
            })
    );
};
