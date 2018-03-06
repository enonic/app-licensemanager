var storeLib = require('/lib/store');
var initLib = require('/lib/init');

exports.get = function (req) {
    var search = req.params.search;

    var apps = {total: 0, start: 0, count: 0, hits: []};
    try {
        apps = storeLib.getApplications(search);
    } catch (e) {
        initLib.initialize();
        apps = storeLib.getApplications(search);
    }

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            apps: apps
        }
    }
};
