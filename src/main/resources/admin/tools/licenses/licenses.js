const mustacheLib = require('/lib/mustache');
const portalLib = require('/lib/xp/portal');
const adminLib = require('/lib/xp/admin');
const assetLib = require('/lib/enonic/asset');

const assetUrl = assetLib.assetUrl;
const render = mustacheLib.render;
const serviceUrl = portalLib.serviceUrl;

const VIEW = resolve('licenses.html');

exports.get = function () {
    const svcUrl = serviceUrl({service: 'Z'}).slice(0, -1);

    const params = {
        assetsUri: assetUrl({path: ''}),
        svcUrl: svcUrl,
        menuLoaderUrl: adminLib.extensionUrl({
            application: 'com.enonic.xp.app.main',
            extension: 'menu-loader',
            params: {
                theme: 'dark'
            }
        }),
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    }
};
