var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');

var view = resolve('page.html');

exports.get = function () {
    var user = authLib.getUser();
    if (!user) {
        return {
            status: 401
        }
    }

    var appBaseUrl = '/app/' + app.name;
    var t = new Date();
    var t2 = new Date();
    t2.setFullYear(t2.getFullYear() + 1);

    var params = {
        baseUri: appBaseUrl + '/',
        assetsUri: appBaseUrl,
        generateUrl: portalLib.serviceUrl({service: 'generate'}),
        validateUrl: portalLib.serviceUrl({service: 'validate'}),
        generateKeysUrl: portalLib.serviceUrl({service: 'generateKeys'}),
        loadKeysUrl: portalLib.serviceUrl({service: 'loadKeys'}),
        currentUser: user.key || '',
        issueTime: t.toISOString(),
        expiryTime: t2.toISOString()
    };

    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    }
};
