var adminLib = require('/lib/xp/admin');
var mustacheLib = require('/lib/mustache');
var portalLib = require('/lib/xp/portal');


var assetUrl = portalLib.assetUrl;
var getHomeToolUrl = adminLib.getHomeToolUrl;
var render = mustacheLib.render;
var serviceUrl = portalLib.serviceUrl;


var VIEW = resolve('licenses.html');


exports.get = function () {
    var svcUrl = serviceUrl({service: 'Z'}).slice(0, -1);

    var params = {
        adminUrl: getHomeToolUrl(),
        appId: app.name,
        assetsUri: assetUrl({path: ''}),
        svcUrl: svcUrl
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    }
};
