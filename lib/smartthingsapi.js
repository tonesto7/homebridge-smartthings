var http = require('https');
var url = require('url');

var app_host;
var app_port;
var app_path;
var access_token;

function _http(data, callback) {
    //console.log("Calling Smartthings");
    var options = {
        hostname: app_host,
        port: app_port,
        path: app_path + data.path + "?access_token=" + access_token,
        method: data.method,
        headers: {}
    };

    var that = this;
    if (data.data) {
        data.data = JSON.stringify(data.data);
        options.headers['Content-Length'] = Buffer.byteLength(data.data);
        options.headers['Content-Type'] = "application/json";
    }

    var str = '';
    var req = http.request(options, function (response) {

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            if (data.debug) console.log("response in http:", str);
            try {
                str = JSON.parse(str);
            } catch (e) {
                if (data.debug) {
                    console.log(e.stack);
                    console.log("raw message", str);
                }
                str = undefined;
            }

            if (callback) { callback(str); callback=undefined; };
        });
    });

    if (data.data) {
        req.write(data.data);
    }

    req.end();

    req.on('error', function (e) {
        console.log("error at req: ", e.message);
        if (callback) { callback(); callback=undefined; };
    });
    

}

function POST(data, callback) {
    data.method = "POST";
    _http(data, callback);
}

function PUT(data, callback) {
    data.method = "PUT";
    _http(data, callback);
}

function GET(data, callback) {
    data.method = "GET";
    _http(data, callback);
}

function DELETE(data, callback) {
    data.method = "DELETE";
    _http(data, callback);
}

var smartthings = {
    init: function (inURL, inAppID, inAccess_Token) {
        var appURL = url.parse(inURL);

        app_host = appURL.hostname || "graph.api.smartthings.com";
        app_port = appURL.port || "443";
        app_path = (appURL.path || "/api/smartapps/installations/") + inAppID + "/";
        access_token = inAccess_Token;
    },
    getDevices: function (callback) {
        GET({ debug: false, path: 'devices' }, function (data) {
            if (callback) { callback(data); callback=undefined; };
        })
    },
    getDevice: function (deviceid, callback) {
        GET({ debug: false, path: deviceid + '/query' }, function (data) {
            if (data) {
                if (callback) { callback(data); callback=undefined; };
            } else {
                if (callback) { callback(); callback=undefined; };;
            }
        })
    },
    getUpdates: function (callback) {
        GET({ debug: false, path: 'getUpdates' }, function (data) {
            if (callback) { callback(data); callback=undefined; };;
        })
    },
    runCommand: function (callback, deviceid, command, values) {
        POST({ debug: false, path: deviceid + '/command/' + command, data: values }, function (data) {
            if (callback) { callback(); callback=undefined; };;
        })
    },
    startDirect: function (callback, myIP, myPort) {
        GET({ debug: false, path: 'startDirect/' + myIP + '/' + myPort }, function (data) {
            if (callback) { callback(); callback=undefined; };;
        })
    },
    getSubscriptionService: function (callback) {
        GET({ debug: false, path: 'getSubcriptionService' }, function (data) {
            if (callback) { callback(data); callback=undefined; };;
        })
    }
}
module.exports = smartthings;