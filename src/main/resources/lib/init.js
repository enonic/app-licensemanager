var contextLib = require('/lib/xp/context');
var storeLib = require('/lib/store');
var authLib = require('/lib/xp/auth');

var LICENSE_MANAGER_ROLE = 'com.enonic.app.licensemanager';

exports.initialize = function () {
    log.info('Initializing License Manager...');

    var ctx = {
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    };
    contextLib.run(ctx, createRole);
    contextLib.run(ctx, storeLib.initialize);

    log.info('License Manager initialized.');
};


var createRole = function () {
    var licenseRole = authLib.getPrincipal('role:' + LICENSE_MANAGER_ROLE);
    if (licenseRole) {
        log.info('License Manager role found.');
    } else {
        authLib.createRole({
            name: LICENSE_MANAGER_ROLE,
            displayName: 'License Manager'
        });
        log.info('License Manager role has been created.');
    }
};