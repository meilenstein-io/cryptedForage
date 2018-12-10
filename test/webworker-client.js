/*globals importScripts:true, self:true */
importScripts('/dist/cryptedforage.js');

self.addEventListener(
    'message',
    function(e) {
        function handleError(e) {
            self.postMessage({
                error: JSON.stringify(e),
                body: e,
                fail: true
            });
        }

        cryptedforage.setDriver(
            e.data.driver,
            function() {
                cryptedforage
                    .setItem(
                        'web worker',
                        e.data.value,
                        function() {
                            cryptedforage.getItem('web worker', function(
                                err,
                                value
                            ) {
                                self.postMessage({
                                    body: value
                                });
                            });
                        },
                        handleError
                    )
                    .catch(handleError);
            },
            handleError
        );
    },
    false
);
