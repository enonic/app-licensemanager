var storeLib = require('/lib/store');

exports.post = function (req) {
    storeLib.deleteLicense(req.params.id);

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true
        }
    }
};
