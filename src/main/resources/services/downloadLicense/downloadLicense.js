var storeLib = require('/lib/store');

exports.get = function (req) {

    var license = storeLib.getLicenseById(req.params.id);
    if (!license) {
        return {
            contentType: 'text/plain',
            status: 404,
            body: 'License not found'
        }
    }
    var app = storeLib.getApplicationByLicenseId(req.params.id);

    var body = license.license;

    var parts = [];
    if (license.issuedTo) {
        parts.push(storeLib.prettifyName(license.issuedTo));
    }
    if (app && app.displayName) {
        parts.push(storeLib.prettifyName(app.displayName));
    }
    if (license.issueTime) {
        parts.push(license.issueTime.substring(0, 10));
    }
    var fileName = (parts.length ? parts.join('-') : 'license') + '.lic';

    return {
        contentType: 'text/plain',
        headers: {
            'Content-Disposition': 'attachment; filename="' + fileName + '"',
        },
        status: 200,
        body: body
    }
};
