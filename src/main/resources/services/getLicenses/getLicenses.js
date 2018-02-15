var storeLib = require('/lib/store');

exports.get = function (req) {

    var licenses = storeLib.getLicenses(req.params.id);

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            licenses: licenses
        }
    }
};
