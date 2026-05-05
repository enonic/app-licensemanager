var mustacheLib = require('/lib/mustache');
var portalLib = require('/lib/xp/portal');


var assetUrl = portalLib.assetUrl;
var render = mustacheLib.render;
var serviceUrl = portalLib.serviceUrl;


var VIEW = resolve('licenses.html');


exports.get = function () {
    var svcUrl = serviceUrl({service: 'Z'}).slice(0, -1);

    var params = {
        appId: app.name,
        assetsUri: assetUrl({path: ''}),
        svcUrl: svcUrl
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    }
};
