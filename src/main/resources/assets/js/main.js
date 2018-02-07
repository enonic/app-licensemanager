/* eslint-env browser, es6 */
'use strict';

const $generateButton = $('.js-generate-btn');
const $validateButton = $('.js-validate-btn');
const $generateKeyPairButton = $('.js-generate-key-btn');
const generateUrl = document.currentScript.getAttribute('data-generateUrl');
const validateUrl = document.currentScript.getAttribute('data-validateUrl');
const generateKeysUrl = document.currentScript.getAttribute('data-generateKeysUrl');
const loadKeysUrl = document.currentScript.getAttribute('data-loadKeysUrl');

const $issuedByInput = $('.js-license-issuedBy');
const $issuedToInput = $('.js-license-issuedTo');
const $issuedInput = $('.js-license-issued');
const $expiryInput = $('.js-license-expiry');
const $value1Input = $('.js-license-value1');
const $value2Input = $('.js-license-value2');
const $value3Input = $('.js-license-value3');
const $key1Input = $('.js-license-key1');
const $key2Input = $('.js-license-key2');
const $key3Input = $('.js-license-key3');
const $validLicenseLabel = $('.js-valid-license');
const $invalidLicenseLabel = $('.js-invalid-license');
const $expiredLicenseLabel = $('.js-expired-license');
const $licenseInput = $('.js-license');
const $keyPairInput = $('.js-keypair');
const $publicKeyInput = $('.js-publickey');
const $privateKeyInput = $('.js-privatekey');

$(function () {
    $generateButton.on('click', generateRequest);
    $validateButton.on('click', validateRequest);
    $generateKeyPairButton.on('click', generateKeysRequest);
    $keyPairInput.on('keyup', loadKeysRequest);
});

function generateRequest() {
    const issuedBy = $issuedByInput.val();
    const issuedTo = $issuedToInput.val();
    const issued = $issuedInput.val();
    const expiry = $expiryInput.val();
    const keyPair = $keyPairInput.val();
    const privateKey = $privateKeyInput.val();
    const publicKey = $publicKeyInput.val();
    const value1 = $value1Input.val();
    const value2 = $value2Input.val();
    const value3 = $value3Input.val();
    const key1 = $key1Input.val();
    const key2 = $key2Input.val();
    const key3 = $key3Input.val();

    $generateButton.prop('disabled', true);
    $.ajax({
        url: generateUrl,
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
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
        }
    }).done(function (resp) {
        $licenseInput.val(resp.license);
        $generateButton.prop('disabled', false);

    }).fail(function (xhr) {
        $generateButton.prop('disabled', false);
        console.log('Error');
    });
}

function validateRequest() {
    const encodedLicense = $licenseInput.val();
    const keyPair = $keyPairInput.val();
    const publicKey = $publicKeyInput.val();

    $validateButton.prop('disabled', true);
    $validLicenseLabel.hide();
    $invalidLicenseLabel.hide();
    $expiredLicenseLabel.hide();

    $.ajax({
        url: validateUrl,
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
            license: encodedLicense,
            keyPair: keyPair,
            publicKey: publicKey
        }
    }).done(function (resp) {
        if (resp.isValid) {
            $issuedByInput.val(resp.license.issuedBy);
            $issuedToInput.val(resp.license.issuedTo);
            $issuedInput.val(resp.license.issueTime);
            $expiryInput.val(resp.license.expiryTime);
            $validLicenseLabel.toggle(!resp.expired);
            $expiredLicenseLabel.toggle(resp.expired);
            $invalidLicenseLabel.hide();
        } else {
            $validLicenseLabel.hide();
            $invalidLicenseLabel.show();
            $expiredLicenseLabel.hide();
        }
        $validateButton.prop('disabled', false);

    }).fail(function (xhr) {
        $validateButton.prop('disabled', false);
        console.log('Error');
    });
}

function generateKeysRequest() {
    $generateKeyPairButton.prop('disabled', true);
    $.ajax({
        url: generateKeysUrl,
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {}
    }).done(function (resp) {
        $publicKeyInput.val(resp.publicKey);
        $privateKeyInput.val(resp.privateKey);
        $keyPairInput.val(resp.keyPair);
        $generateKeyPairButton.prop('disabled', false);

    }).fail(function (xhr) {
        $generateKeyPairButton.prop('disabled', false);
        console.log('Error');
    });
}

function loadKeysRequest() {
    $.ajax({
        url: loadKeysUrl,
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
            keyPair: $keyPairInput.val()
        }
    }).done(function (resp) {
        if (resp.publicKey) {
            $publicKeyInput.val(resp.publicKey);
        }
        if (resp.privateKey) {
            $privateKeyInput.val(resp.privateKey);
        }

    }).fail(function (xhr) {
        console.log('Error');
    });
}
