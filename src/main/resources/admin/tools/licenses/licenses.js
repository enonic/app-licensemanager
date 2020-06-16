var adminLib = require('/lib/xp/admin');
var mustacheLib = require('/lib/mustache');
var portalLib = require('/lib/xp/portal');


var assetUrl = portalLib.assetUrl;
var getBaseUri = adminLib.getBaseUri;
var getLauncherPath = adminLib.getLauncherPath;
var getLauncherUrl = adminLib.getLauncherUrl;
var render = mustacheLib.render;
var serviceUrl = portalLib.serviceUrl;


var VIEW = resolve('licenses.html');


exports.get = function () {
    var svcUrl = serviceUrl({service: 'Z'}).slice(0, -1);

    var params = {
        adminUrl: getBaseUri(),
        appId: app.name,
        assetsUri: assetUrl({path: ''}),
        launcherPath: getLauncherPath(),
        launcherUrl: getLauncherUrl(),
        svcUrl: svcUrl
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    }
};
