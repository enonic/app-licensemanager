var repoLib = require('/lib/xp/repo');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');

var REPO_NAME = 'license-repo';
var APPLICATIONS_PATH = '/applications';

var ROOT_PERMISSIONS = [
    {
        'principal': 'role:system.authenticated',
        'allow': [
            'READ',
            'CREATE',
            'MODIFY',
            'DELETE',
            'PUBLISH',
            'READ_PERMISSIONS',
            'WRITE_PERMISSIONS'
        ],
        'deny': []
    }
];

exports.initialize = function () {
    log.info('Initializing License repository...');

    contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, doInitialize);


    log.info('License repository initialized.');
};

var doInitialize = function () {
    var result = repoLib.get(REPO_NAME);

    if (result) {
        log.info('Repository found');
    } else {
        log.info('Repository not found');
        createRepo();
    }
    createRootNodes();
};

var createRepo = function () {
    log.info('Creating repository...');
    var newRepo = repoLib.create({
        id: REPO_NAME,
        rootPermissions: ROOT_PERMISSIONS
    });
    log.info('Repository created.');
};

var createRootNodes = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });

    var applicationsExist = nodeWithPathExists(repoConn, APPLICATIONS_PATH);
    if (!applicationsExist) {
        log.info('Creating node [' + APPLICATIONS_PATH + '] ...');
        var appsNode = repoConn.create({
            _name: APPLICATIONS_PATH.slice(1),
            _parentPath: '/',
            _permissions: ROOT_PERMISSIONS //TODO remove after XP issue 4801 is fixed
        });
    }
};

var nodeWithPathExists = function (repoConnection, path) {
    var result = repoConnection.query({
        start: 0,
        count: 0,
        query: "_path = '" + path + "'"
    });
    return result.total > 0;
};
