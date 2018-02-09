var storeLib = require('/lib/store');
var licenseLib = require('/lib/license');

exports.post = function (req) {
    var name = req.params.name;
    var displayName = req.params.displayName;
    var id = req.params.id;
    var notes = req.params.notes || '';

    if (!id) {
        return createApp(name, displayName);
    } else {
        return updateApp(id, notes);
    }
};

var createApp = function (name, displayName) {
    if (storeLib.appNameInUse(name)) {
        return {
            contentType: 'application/json',
            status: 200,
            body: {
                ok: false,
                reason: 'Name already in use'
            }
        }
    }

    var keyPairObj = licenseLib.generateKeyPair();

    var appId = storeLib.createApp({
        name: name,
        displayName: displayName,
        privateKey: keyPairObj.privateKey,
        publicKey: keyPairObj.publicKey
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