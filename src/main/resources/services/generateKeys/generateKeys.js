var licenseLib = require('/lib/license');

exports.post = function (req) {
    var keyPairObj = licenseLib.generateKeyPair();

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            privateKey: keyPairObj.privateKey,
            publicKey: keyPairObj.publicKey,
            keyPair: keyPairObj.toString()
        }
    }
};
