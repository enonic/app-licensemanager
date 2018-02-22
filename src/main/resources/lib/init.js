var contextLib = require('/lib/xp/context');
var storeLib = require('/lib/store');

exports.initialize = function () {
    log.info('Initializing License Manager repository...');

    contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, storeLib.initialize);


    log.info('License Manager repository initialized.');
};

