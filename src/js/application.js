/*
Config
 */
requirejs.config({
    baseUrl: "js",
    paths: {
        jquery: 'jquery-3.0.0.min',
        moment: 'moment.min',
        socket: 'http://cdn.jsdelivr.net/sockjs/1/sockjs.min',
        multiplex: 'https://d1fxtkz8shb9d2.cloudfront.net/websocket-multiplex-0.1',
        EventEmitter: 'EventEmitter.min',
        ect: 'ect.min'
    }
});
/*
 App
 */
require(['script']);
require(['server']);