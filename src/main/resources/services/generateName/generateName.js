var storeLib = require('/lib/store');

exports.post = function (req) {
    var sourceName = (req.params.name || '').trim();
    if (!sourceName) {
        return {
            contentType: 'application/json',
            status: 200,
            body: {
                name: ''
            }
        }
    }

    var name = storeLib.prettifyName(sourceName);
    var i = 1;
    while (storeLib.appNameInUse(name)) {
        i += 1;
        name = storeLib.prettifyName(sourceName) + '-' + i;
    }

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            name: name
        }
    }
};
