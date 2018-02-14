var licenseLib = require('/lib/license');
var storeLib = require('/lib/store');

exports.post = function (req) {
    var issuedBy = req.params.issuedBy;
    var issuedTo = req.params.issuedTo;
    var issueTime = parseDate(req.params.issueTime);
    var expirationTime = parseDate(req.params.expirationTime);
    var id = req.params.id;

    var app = storeLib.getApplicationById(id);
    if (!app) {
        return {
            contentType: 'application/json',
            status: 200,
            body: {
                ok: false
            }
        }
    }

    var properties = {};

    var license = licenseLib.generateLicense(app.privateKey, {
        issuedBy: issuedBy,
        issuedTo: issuedTo,
        issueTime: issueTime,
        expiryTime: expirationTime,
        properties: properties
    });

    var licenseId = storeLib.createLicense({
        appId: id,
        license: license,
        issuedTo: issuedTo,
        issuedBy: issuedBy,
        issueTime: issueTime,
        expiryTime: expirationTime
    });

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            license: licenseId
        }
    }
};

var parseDate = function (value) {
    value = value.trim();
    var m = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    return m ? new Date(m[1], m[2] - 1, m[3]) : null;
};