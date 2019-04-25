var mustacheLib = require('/lib/mustache');
var portalLib = require('/lib/xp/portal');

var view = resolve('licenses.html');

exports.get = function () {
    var svcUrl = portalLib.serviceUrl({service: 'Z'}).slice(0, -1);

    var params = {
        assetsUri: portalLib.assetUrl({path: ""}),
        svcUrl: svcUrl
    };

    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    }
};
