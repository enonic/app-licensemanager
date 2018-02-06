/* eslint-env browser, es6 */
'use strict';

const generateButton = document.querySelector('.js-generate-btn');
const validateButton = document.querySelector('.js-validate-btn');
const generateKeyPairButton = document.querySelector('.js-generate-key-btn');
const generateUrl = document.currentScript.getAttribute('data-generateUrl');
const validateUrl = document.currentScript.getAttribute('data-validateUrl');
const generateKeysUrl = document.currentScript.getAttribute('data-generateKeysUrl');
const loadKeysUrl = document.currentScript.getAttribute('data-loadKeysUrl');

const issuedByInput = document.querySelector('.js-license-issuedBy');
const issuedToInput = document.querySelector('.js-license-issuedTo');
const issuedInput = document.querySelector('.js-license-issued');
const expiryInput = document.querySelector('.js-license-expiry');
const value1Input = document.querySelector('.js-license-value1');
const value2Input = document.querySelector('.js-license-value2');
const value3Input = document.querySelector('.js-license-value3');
const key1Input = document.querySelector('.js-license-key1');
const key2Input = document.querySelector('.js-license-key2');
const key3Input = document.querySelector('.js-license-key3');
const validLicenseLabel = document.querySelector('.js-valid-license');
const invalidLicenseLabel = document.querySelector('.js-invalid-license');
const expiredLicenseLabel = document.querySelector('.js-expired-license');
const licenseInput = document.querySelector('.js-license');
const keyPairInput = document.querySelector('.js-keypair');
const publicKeyInput = document.querySelector('.js-publickey');
const privateKeyInput = document.querySelector('.js-privatekey');

window.onload = function WindowLoad() {
    generateButton.addEventListener('click', function () {
        generateRequest();
    });
    validateButton.addEventListener('click', function () {
        validateRequest();
    });
    generateKeyPairButton.addEventListener('click', function () {
        generateKeysRequest();
    });

    keyPairInput.onkeyup = function (e) {
        console.log('change');
        loadKeysRequest();
    };
};

function generateRequest() {
    const issuedBy = issuedByInput.value;
    const issuedTo = issuedToInput.value;
    const issued = issuedInput.value;
    const expiry = expiryInput.value;
    const keyPair = keyPairInput.value;
    const privateKey = privateKeyInput.value;
    const publicKey = publicKeyInput.value;
    const value1 = value1Input.value;
    const value2 = value2Input.value;
    const value3 = value3Input.value;
    const key1 = key1Input.value;
    const key2 = key2Input.value;
    const key3 = key3Input.value;

    const request = new XMLHttpRequest();
    request.open('POST', generateUrl, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    var urlParams = encodeParams({
        issuedBy: issuedBy,
        issuedTo: issuedTo,
        issued: issued,
        expiry: expiry,
        keyPair: keyPair,
        privateKey: privateKey,
        publicKey: publicKey,
        key1: key1,
        key2: key2,
        key3: key3,
        value1: value1,
        value2: value2,
        value3: value3
    });

    request.onload = function (e) {
        if (request.status === 200) {
            var resp = JSON.parse(this.responseText);
            var genLic = document.querySelector('.js-license');
            genLic.value = resp.license;
        }
        generateButton.disabled = false;
    };

    request.onerror = function () {
        generateButton.disabled = false;
        console.log('Error');
    };

    generateButton.disabled = true;
    request.send(urlParams);
}

function validateRequest() {
    const encodedLicense = licenseInput.value;
    const keyPair = keyPairInput.value;
    const publicKey = publicKeyInput.value;

    const request = new XMLHttpRequest();
    request.open('POST', validateUrl, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    var urlParams = encodeParams({
        license: encodedLicense,
        keyPair: keyPair,
        publicKey: publicKey
    });

    request.onload = function (e) {
        if (request.status === 200) {
            var resp = JSON.parse(this.responseText);
            if (resp.isValid) {
                issuedByInput.value = resp.license.issuedBy;
                issuedToInput.value = resp.license.issuedTo;
                issuedInput.value = resp.license.issueTime;
                expiryInput.value = resp.license.expiryTime;
                validLicenseLabel.style.display = resp.expired ? 'none' : '';
                expiredLicenseLabel.style.display = resp.expired ? '' : 'none';
                invalidLicenseLabel.style.display = 'none';
            } else {
                validLicenseLabel.style.display = 'none';
                invalidLicenseLabel.style.display = '';
                expiredLicenseLabel.style.display = 'none';
            }
        }
        validateButton.disabled = false;
    };

    request.onerror = function () {
        validateButton.disabled = false;
        console.log('Error');
    };

    validateButton.disabled = true;
    validLicenseLabel.style.display = 'none';
    invalidLicenseLabel.style.display = 'none';
    expiredLicenseLabel.style.display = 'none';
    request.send(urlParams);
}

function generateKeysRequest() {
    const request = new XMLHttpRequest();
    request.open('POST', generateKeysUrl, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    request.onload = function (e) {
        if (request.status === 200) {
            var resp = JSON.parse(this.responseText);
            publicKeyInput.value = resp.publicKey;
            privateKeyInput.value = resp.privateKey;
            keyPairInput.value = resp.keyPair;
        }
        generateKeyPairButton.disabled = false;
    };

    request.onerror = function () {
        generateKeyPairButton.disabled = false;
        console.log('Error');
    };

    generateKeyPairButton.disabled = true;
    request.send('');
}

function loadKeysRequest() {
    const request = new XMLHttpRequest();
    request.open('POST', loadKeysUrl, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var urlParams = encodeParams({keyPair: keyPairInput.value});

    request.onload = function (e) {
        if (request.status === 200) {
            var resp = JSON.parse(this.responseText);
            if (resp.publicKey) {
                publicKeyInput.value = resp.publicKey;
            }
            if (resp.privateKey) {
                privateKeyInput.value = resp.privateKey;
            }
        }
    };

    request.onerror = function () {
        console.log('Error');
    };

    request.send(urlParams);
}

function encodeParams(params) {
    var urlParams = '';
    for (let [k, v] of Object.entries(params)) {
        if (urlParams) {
            urlParams += '&'
        }
        urlParams += k + '=' + encodeURIComponent(v);
    }
    return urlParams;
}
