var storeLib = require('/lib/store');

exports.get = function (req) {
    var search = req.params.search;

    var apps = storeLib.getApplications(search);

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            apps: apps
        }
    }
};
