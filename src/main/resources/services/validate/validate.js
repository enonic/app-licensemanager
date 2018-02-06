var licenseLib = require('/lib/license');

exports.post = function (req) {
    var encodedLicense = req.params.license;
    var publicKey = req.params.publicKey;
    var keyPair = req.params.keyPair;

    if (!publicKey && keyPair) {
        var keyPairObj = licenseLib.loadKeyPair(keyPair);
        if (keyPairObj) {
            publicKey = keyPairObj.publicKey;
        }
    }

    var licenseDetails = licenseLib.validateLicense(encodedLicense, publicKey);

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            isValid: licenseDetails != null,
            expired: licenseDetails != null && licenseDetails.expired,
            license: licenseDetails
        }
    }
};
