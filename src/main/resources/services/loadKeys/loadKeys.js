var licenseLib = require('/lib/license');

exports.post = function (req) {
    var keyPair = req.params.keyPair;
    var keyPairObj = licenseLib.loadKeyPair(keyPair);
    var privateKey = '';
    var publicKey = '';
    if (keyPairObj) {
        privateKey = keyPairObj.privateKey;
        publicKey = keyPairObj.publicKey;
    }

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            privateKey: privateKey,
            publicKey: publicKey
        }
    }
};
