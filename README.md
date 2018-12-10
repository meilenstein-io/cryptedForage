# cryptedForage

[![Build Status](https://travis-ci.org/cryptedForage/cryptedForage.svg?branch=master)](http://travis-ci.org/cryptedForage/cryptedForage)
[![NPM version](https://badge.fury.io/js/cryptedforage.svg)](http://badge.fury.io/js/cryptedforage)
[![Dependency Status](https://img.shields.io/david/cryptedForage/cryptedForage.svg)](https://david-dm.org/cryptedForage/cryptedForage)
[![npm](https://img.shields.io/npm/dm/cryptedforage.svg?maxAge=2592000)](https://npmcharts.com/compare/cryptedforage?minimal=true)
[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/cryptedforage/badge?style=rounded)](https://www.jsdelivr.com/package/npm/cryptedforage)

cryptedForage is a fast and simple storage library for JavaScript. cryptedForage
improves the offline experience of your web app by using asynchronous storage
(IndexedDB or WebSQL) with a simple, `localStorage`-like API.

cryptedForage uses localStorage in browsers with no IndexedDB or
WebSQL support. See [the wiki for detailed compatibility info][supported browsers].

To use cryptedForage, just drop a single JavaScript file into your page:

```html
<script src="cryptedforage/dist/cryptedforage.js"></script>
<script>cryptedforage.getItem('something', myCallback);</script>
```

Try the [live example](http://codepen.io/thgreasi/pen/ojYKeE).

Download the [latest cryptedForage from GitHub](https://github.com/cryptedForage/cryptedForage/releases/latest), or install with
[npm](https://www.npmjs.com/):

```bash
npm install cryptedforage
```

cryptedForage is compatible with [browserify](http://browserify.org/).

[supported browsers]: https://github.com/cryptedForage/cryptedForage/wiki/Supported-Browsers-Platforms

## Support

Lost? Need help? Try the
[cryptedForage API documentation](https://cryptedforage.github.io/cryptedForage). [cryptedForage API 文档也有中文版。](https://cryptedforage.docschina.org)

If you're having trouble using the library, running the tests, or want to contribute
to cryptedForage, you can visit
[irc.freenode.net](https://freenode.net/) and head to the `#cryptedforage`
channel to ask questions about cryptedForage.

You can ask [**tofumatt**][tofumatt] about cryptedForage in IRC, who
is usually online from 10am-8pm GMT.

[tofumatt]: http://tofumatt.com/

## Safari 10.1+

Since Safari 10.1 we default to IndexedDB; see the [CHANGELOG](https://github.com/cryptedForage/cryptedForage/blob/master/CHANGELOG.md) for more info.

# How to use cryptedForage

## Callbacks vs Promises

Because cryptedForage uses async storage, it has an async API.
It's otherwise exactly the same as the
[localStorage API](https://hacks.mozilla.org/2009/06/localstorage/).

cryptedForage has a dual API that allows you to either use Node-style callbacks
or [Promises](https://www.promisejs.org/). If you are unsure which one is right for you, it's recommended to use Promises.

Here's an example of the Node-style callback form:

```js
cryptedforage.setItem('key', 'value', function(err) {
    // if err is non-null, we got an error
    cryptedforage.getItem('key', function(err, value) {
        // if err is non-null, we got an error. otherwise, value is the value
    });
});
```

And the Promise form:

```js
cryptedforage
    .setItem('key', 'value')
    .then(function() {
        return cryptedforage.getItem('key');
    })
    .then(function(value) {
        // we got our value
    })
    .catch(function(err) {
        // we got an error
    });
```

For more examples, please visit [the API docs](https://cryptedforage.github.io/cryptedForage).

## Storing Blobs, TypedArrays, and other JS objects

You can store any type in cryptedForage; you aren't limited to strings like in
localStorage. Even if localStorage is your storage backend, cryptedForage
automatically does `JSON.parse()` and `JSON.stringify()` when getting/setting
values.

cryptedForage supports storing all native JS objects that can be serialized to
JSON, as well as ArrayBuffers, Blobs, and TypedArrays. Check the
[API docs][api] for a full list of types supported by cryptedForage.

All types are supported in every storage backend, though storage limits in
localStorage make storing many large Blobs impossible.

[api]: https://cryptedforage.github.io/cryptedForage/#data-api-setitem

## Configuration

You can set database information with the `config()` method.
Available options are `driver`, `name`, `storeName`, `version`, `size`, and
`description`.

Example:

```javascript
cryptedforage.config({
    driver: cryptedforage.WEBSQL, // Force WebSQL; same as using setDriver()
    name: 'myApp',
    version: 1.0,
    size: 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName: 'keyvaluepairs', // Should be alphanumeric, with underscores.
    description: 'some description',
    secret: 'YOUR_SECRET' // will be generated automatically if not specified
});
```

**Note:** you must call `config()` _before_ you interact with your data. This
means calling `config()` before using `getItem()`, `setItem()`, `removeItem()`,
`clear()`, `key()`, `keys()` or `length()`.

## Multiple instances

You can create multiple instances of cryptedForage that point to different stores
using `createInstance`. All the configuration options used by
[`config`](#configuration) are supported.

```javascript
var store = cryptedforage.createInstance({
    name: 'nameHere'
});

var otherStore = cryptedforage.createInstance({
    name: 'otherName'
});

// Setting the key on one of these doesn't affect the other.
store.setItem('key', 'value');
otherStore.setItem('key', 'value2');
```

## RequireJS

You can use cryptedForage with [RequireJS](http://requirejs.org/):

```javascript
define(['cryptedforage'], function(cryptedforage) {
    // As a callback:
    cryptedforage.setItem('mykey', 'myvalue', console.log);

    // With a Promise:
    cryptedforage.setItem('mykey', 'myvalue').then(console.log);
});
```

## Browserify and Webpack

cryptedForage 1.3+ works with both Browserify and Webpack. If you're using an
earlier version of cryptedForage and are having issues with Browserify or
Webpack, please upgrade to 1.3.0 or above.

Webpack will emit a warning about using a prebuilt javascript file which is fine. If you want to remove the warning you should exclude `cryptedforage` from being parsed by webpack using the following conf :

```javascript
module: {
  noParse: /node_modules\/cryptedforage\/dist\/cryptedforage.js/,
  loaders: [...],
```

## TypeScript

If you have the [`allowSyntheticDefaultImports` compiler option](https://www.typescriptlang.org/docs/handbook/compiler-options.html) set to `true` in your [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) (supported in TypeScript v1.8+), you should use:

```javascript
import cryptedForage from 'cryptedforage';
```

Otherwise you should use one of the following:

```javascript
import * as cryptedForage from "cryptedforage";
// or, in case that the typescript version that you are using
// doesn't support ES6 style imports for UMD modules like cryptedForage
import cryptedForage = require("cryptedforage");
```

## Framework Support

If you use a framework listed, there's a cryptedForage storage driver for the
models in your framework so you can store data offline with cryptedForage. We
have drivers for the following frameworks:

*   [AngularJS](https://github.com/ocombe/angular-cryptedForage)
*   [Angular 4 and up](https://github.com/Alorel/ngforage/)
*   [Backbone](https://github.com/cryptedForage/cryptedForage-backbone)
*   [Ember](https://github.com/genkgo/ember-cryptedforage-adapter)
*   [Vue](https://github.com/dmlzj/vlf)

If you have a driver you'd like listed, please
[open an issue](https://github.com/cryptedForage/cryptedForage/issues/new) to have it
added to this list.

## Custom Drivers

You can create your own driver if you want; see the
[`defineDriver`](https://cryptedforage.github.io/cryptedForage/#driver-api-definedriver) API docs.

There is a [list of custom drivers on the wiki][custom drivers].

[custom drivers]: https://github.com/cryptedForage/cryptedForage/wiki/Custom-Drivers

# Working on cryptedForage

You'll need [node/npm](http://nodejs.org/) and
[bower](http://bower.io/#installing-bower).

To work on cryptedForage, you should start by
[forking it](https://github.com/cryptedForage/cryptedForage/fork) and installing its
dependencies. Replace `USERNAME` with your GitHub username and run the
following:

```bash
# Install bower globally if you don't have it:
npm install -g bower

# Replace USERNAME with your GitHub username:
git clone git@github.com:USERNAME/cryptedForage.git
cd cryptedForage
npm install
bower install
```

Omitting the bower dependencies will cause the tests to fail!

## Running Tests

You need PhantomJS installed to run local tests. Run `npm test` (or,
directly: `grunt test`). Your code must also pass the
[linter](http://jshint.com/).

cryptedForage is designed to run in the browser, so the tests explicitly require
a browser environment. Local tests are run on a headless WebKit (using
[PhantomJS](http://phantomjs.org)).

When you submit a pull request, tests will be run against all browsers that
cryptedForage supports on Travis CI using [Sauce Labs](https://saucelabs.com/).

# License

This program is free software; it is distributed under an
[Apache License](https://github.com/cryptedForage/cryptedForage/blob/master/LICENSE).

---

Copyright (c) 2013-2016 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/cryptedForage/cryptedForage/graphs/contributors)).
