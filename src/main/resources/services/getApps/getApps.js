var storeLib = require('/lib/store');

exports.get = function (req) {

    var apps = storeLib.getApplications();

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            apps: apps
        }
    }
};
