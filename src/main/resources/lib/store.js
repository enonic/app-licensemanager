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
    LICENSE: 'license'
};

/**
 * @typedef {Object} Application
 * @property {string} type Object type: 'application'
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
 * @param  {number} [start=0] First index of the applications.
 * @param  {number} [count=10] Number of applications to fetch.
 * @return {ApplicationResponse} Applications.
 */
exports.getApplications = function (start, count) {
    var apps = query({
        start: start || 0,
        count: count || 20,
        query: "type = '" + TYPE.APPLICATION + "'",
        sort: "name ASC"
    });
    apps.hits = apps.hits.map(fetchAppLicenses).map(appFromNode);

    return apps;
};

/**
 * Retrieve an application by its id.
 * @param  {string} id Application id.
 * @return {Application|null} Applications.
 */
exports.getApplicationById = function (id) {
    var repoConn = newConnection();
    var result = repoConn.get(id);
    if (!result || result.type !== TYPE.APPLICATION) {
        return null;
    }

    return appFromNode(result);
};

/**
 * Create a new license.
 *
 * @param {object} params JSON with the license parameters.
 * @param {string} params.appId Application id.
 * @param {string} params.license License string.
 * @param {string} params.issuedBy The entity that issued this license.
 * @param {string} params.issuedTo The entity this license is issued to.
 * @param {Date} [params.issueTime] Time when the license was issued.
 * @param {Date} [params.expiryTime] Expiration time for the license.
 * @return {string} License id.
 */
exports.createLicense = function (params) {
    var repoConn = newConnection();

    var app = repoConn.get(params.appId);
    if (!app || app.type !== TYPE.APPLICATION) {
        throw 'Application not found: ' + params.appId;
    }
    var name = generateLicenseName(app._path, params.issuedTo);

    var licenseNode = repoConn.create({
        _parentPath: app._path,
        _name: name,
        _permissions: NODE_PERMISSIONS,
        type: TYPE.LICENSE,
        issuedBy: params.issuedBy,
        issuedTo: params.issuedTo,
        issueTime: params.issueTime,
        expiryTime: params.expiryTime,
        license: params.license
    });

    return licenseNode._id;
};

exports.appNameInUse = function (name) {
    var repoConn = newConnection();
    // TODO run as admin
    return appWithNameExists(repoConn, name);
};

/**
 * Delete a license.
 *
 * @param {string} licenseId License id.
 */
exports.deleteLicense = function (licenseId) {
    var repoConn = newConnection();

    var licenseNode = repoConn.get(licenseId);
    if (!licenseNode || licenseNode.type !== TYPE.LICENSE) {
        return;
    }

    repoConn.delete(licenseId);
    repoConn.refresh('SEARCH');
};

var appFromNode = function (node) {
    return {
        type: node.type,
        id: node._id,
        name: node.name,
        displayName: node.displayName,
        privateKey: node.privateKey,
        publicKey: node.publicKey,
        notes: node.notes,
        licenses: node.licenses || []
    }
};

var licenseFromNode = function (node) {
    return {
        type: node.type,
        id: node._id,
        issuedBy: node.issuedBy,
        issuedTo: node.issuedTo,
        issueTime: node.issueTime,
        expiryTime: node.expiryTime,
        license: node.license
    }
};

var fetchAppLicenses = function (appNode) {
    var licenses = query({
        start: 0,
        count: 100,
        query: "type = '" + TYPE.LICENSE + "' AND _parentPath = '" + appNode._path + "'"
    });
    var licenseList = [];
    var i, l, licenseNode;
    for (i = 0, l = licenses.hits.length; i < l; i++) {
        licenseNode = licenses.hits[i];
        licenseList.push(licenseNode);
    }
    appNode.licenses = licenseList.map(licenseFromNode);
    return appNode;
};

var generateLicenseName = function (parentPath, sourceName) {
    // TODO run as admin
    var repoConn = newConnection();

    var name = exports.prettifyName(sourceName);
    var i = 1;
    while (licenseWithNameExists(repoConn, name)) {
        i += 1;
        name = exports.prettifyName(sourceName) + '-' + i;
    }
    return name;
};

var appWithNameExists = function (repoConn, name) {
    var query = "type = '" + TYPE.APPLICATION + "' AND name='" + name + "'";
    return queryExists(query, repoConn)
};

var licenseWithNameExists = function (repoConn, parentPath, name) {
    var query = "_parentPath = '" + parentPath + "' AND _name='" + name + "'";
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
