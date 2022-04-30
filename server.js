/*global
    require, console, __dirname
*/
const connect = require('connect');
const serveStatic = require('serve-static');

connect()
    .use(serveStatic(__dirname))
    .listen(8080, () => {
        'use strict';
        console.log('Server running on 8080...');
    });
