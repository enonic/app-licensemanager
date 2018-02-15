var storeLib = require('/lib/store');
var licenseLib = require('/lib/license');

exports.post = function (req) {
    var displayName = req.params.displayName;
    var id = req.params.id;
    var notes = req.params.notes || '';

    if (!id) {
        return createApp(displayName, notes);
    } else {
        return updateApp(id, notes);
    }
};

var createApp = function (displayName, notes) {
    var keyPairObj = licenseLib.generateKeyPair();

    var appId = storeLib.createApp({
        displayName: displayName,
        privateKey: keyPairObj.privateKey,
        publicKey: keyPairObj.publicKey,
        notes: notes
    });

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            id: appId
        }
    }
};

var updateApp = function (id, notes) {
    storeLib.updateApp({
        id: id,
        notes: notes
    });

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            ok: true,
            id: id
        }
    }
};