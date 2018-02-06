var licenseLib = require('/lib/license');

exports.post = function (req) {
    var issuedBy = req.params.issuedBy;
    var issuedTo = req.params.issuedTo;
    var issued = req.params.issued;
    var expiry = req.params.expiry;
    var privateKey = req.params.privateKey;
    var keyPair = req.params.keyPair;

    var key1 = req.params.key1;
    var key2 = req.params.key2;
    var key3 = req.params.key3;
    var value1 = req.params.value1;
    var value2 = req.params.value2;
    var value3 = req.params.value3;

    if (!privateKey && keyPair) {
        var keyPairObj = licenseLib.loadKeyPair(keyPair);
        if (keyPairObj) {
            privateKey = keyPairObj.privateKey;
        }
    }

    var properties = {};
    if (key1) {
        properties[key1] = value1;
    }
    if (key2) {
        properties[key2] = value2;
    }
    if (key3) {
        properties[key3] = value3;
    }

    var license = licenseLib.generateLicense(privateKey, {
        issuedBy: issuedBy,
        issuedTo: issuedTo,
        issueTime: issued,
        expiryTime: expiry,
        properties: properties
    });

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            license: license
        }
    }
};
