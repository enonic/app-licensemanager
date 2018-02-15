var storeLib = require('/lib/store');

exports.get = function (req) {

    storeLib.refresh();
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
    var fileName = storeLib.prettifyName(app.displayName) + '.lic';

    return {
        contentType: 'text/plain',
        headers: {
            'Content-Disposition': 'attachment; filename="' + fileName + '"',
        },
        status: 200,
        body: body
    }
};
