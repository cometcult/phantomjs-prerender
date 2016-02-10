'use strict';

var system = require('system');

if (system.args.length < 3) {
    console.log("Missing arguments.");
    phantom.exit();
}

var server = require('webserver').create();
var port = parseInt(system.args[1], 10);
var urlPrefix = system.args[2];

var renderHtml = function (url, cb) {
    var page = require('webpage').create();

    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;

    page.onCallback = function () {
        cb(page.content);
        page.close();
    };

    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    };

    page.onError = function (msg, trace) {
        var msgStack = ['ERROR: ' + msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                var functionName = t['function'];
                msgStack.push(' -> ' + t.file + ': ' + t.line + (functionName ? ' (in function "' + functionName + '")' : ''));
            });
        }

        console.error(msgStack.join('\n'));
    };

    page.onInitialized = function () {
        page.evaluate(function () {
            setTimeout(function () {
                window.callPhantom();
            }, 10000);
        });
    };

    page.open(url);
};

server.listen(port, function (request, response) {
    var extensionMatch = /.*\.(\w+)$/;
    var filesExtensions = /css|js|ico|png|jpg|jpeg|gif/;

    var path = request.url.slice(1);

    var extension = extensionMatch.exec(path);
    if (extension && filesExtensions.test(extension[1])) {
        // ignore files, only let through HTML content
        // this prevents infinite loop of incorrect rendering
        response.statusCode = 200;
        response.close();
        return;
    }

    var url = urlPrefix + path;
    console.log(url);

    renderHtml(url, function (html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');
