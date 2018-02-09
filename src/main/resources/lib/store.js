var nodeLib = require('/lib/xp/node');

var REPO_NAME = 'license-repo';
var APPLICATIONS_PATH = '/applications';
var NODE_PERMISSIONS = [
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

var TYPE = {
    APPLICATION: 'application',
    KEY_PAIR: 'keyPair',
    LICENSE: 'license'
};

/**
 * @typedef {Object} Application
 * @property {string} type Object type: 'league'
 * @property {string} id Application id.
 * @property {string} name Name of the application.
 * @property {string} displayName Display name of the application.
 * @property {string} privateKey Private key for generating licenses.
 * @property {string} publicKey Public key for validating licenses.
 * @property {string} notes Notes and comments.
 */

/**
 * @typedef {Object} ApplicationResponse
 * @property {Application[]} hits Array of application objects.
 * @property {number} count Total number of applications.
 * @property {number} total Count of applications returned.
 */

var newConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });
};

exports.refresh = function () {
    var repoConn = newConnection();
    repoConn.refresh('SEARCH');
};

exports.prettifyName = function (text) {
    var namePrettyfier = Java.type('com.enonic.xp.name.NamePrettyfier');
    return namePrettyfier.create(text);
};

/**
 * Create a new application.
 *
 * @param {object} params JSON with the application parameters.
 * @param {string} params.name Unique name of the application.
 * @param {string} params.displayName Display name of the application.
 * @param {string} params.privateKey Private key for generating licenses.
 * @param {string} params.publicKey Public key for validating licenses.
 * @param {string} params.notes Notes and comments.
 * @return {string} Application id.
 */
exports.createApp = function (params) {
    var repoConn = newConnection();
    var nodeName = exports.prettifyName(params.name);
    // TODO validation

    var appNode = repoConn.create({
        _name: nodeName,
        _parentPath: APPLICATIONS_PATH,
        _permissions: NODE_PERMISSIONS,
        type: TYPE.APPLICATION,
        name: params.name,
        displayName: params.displayName,
        privateKey: params.privateKey,
        publicKey: params.publicKey,
        notes: params.notes || ''
    });

    return appNode._id;
};


/**
 * Updates an existing application.
 *
 * @param {object} params JSON with the application parameters.
 * @param {string} params.id Application id.
 * @param {string} params.notes Notes and comments.
 * @return {string} Application id.
 */
exports.updateApp = function (params) {
    var repoConn = newConnection();
    var appNode = repoConn.modify({
        key: params.id,
        editor: function (node) {
            node.notes = params.notes || '';
            return node;
        }
    });
    return appNode._id;
};


/**
 * Retrieve a list of applications.
 * @param  {number} [start=0] First index of the leagues.
 * @param  {number} [count=10] Number of leagues to fetch.
 * @return {ApplicationResponse} Applications.
 */
exports.getApplications = function (start, count) {
    var apps = query({
        start: start,
        count: count,
        query: "type = '" + TYPE.APPLICATION + "'",
        sort: "name ASC"
    });
    apps.hits = apps.hits.map(function (app) {
        return {
            id: app._id,
            name: app.name,
            displayName: app.displayName,
            privateKey: app.privateKey,
            publicKey: app.publicKey,
            notes: app.notes
        }
    });

    return apps;
};

exports.appNameInUse = function (name) {
    var repoConn = newConnection();
    // TODO run as admin
    return appWithNameExists(repoConn, name);
};

var appWithNameExists = function (repoConn, name) {
    //var nodeName = prettifyName(name);
    var query = "type = '" + TYPE.APPLICATION + "' AND name='" + name + "'";
    return queryExists(query, repoConn)
};

function query(params) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: params.start,
        count: params.count,
        query: params.query,
        sort: params.sort
    });

    var hits = [];
    if (queryResult.count > 0) {
        var ids = queryResult.hits.map(function (hit) {
            return hit.id;
        });
        hits = [].concat(repoConn.get(ids));
    }

    return {
        total: queryResult.total,
        start: params.start || 0,
        count: queryResult.count,
        hits: hits
    };
}

/**
 * Check if the query finds any match.
 * @param  {string} query Node query.
 * @param  {Object} [repoConn] RepoConnection object.
 * @return {boolean} True if the query found any items.
 */
function queryExists(query, repoConn) {
    repoConn = repoConn || newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: query
    });
    return queryResult.total > 0;
}

var INVALID_NAME_CHARS = {
    '$': true,
    '&': true,
    '|': true,
    ':': true,
    ';': true,
    '#': true,
    '/': true,
    '\\': true,
    '<': true,
    '>': true,
    '"': true,
    '*': true,
    '+': true,
    ',': true,
    '=': true,
    // '@': true,
    '%': true,
    '{': true,
    '}': true,
    '[': true,
    ']': true,
    '`': true,
    '~': true,
    '^': true,
    // '_': true,
    '\'': true,
    '?': true
};

var hasInvalidChars = function (name) {
    var i, chr;
    for (i = 0; i < name.length; i++) {
        chr = name[i];
        if ((name.charCodeAt(i) < 32) || INVALID_NAME_CHARS[chr]) {
            return true;
        }
    }
    return false
};
