'use strict';
($ => {
    const svcUrl = document.currentScript.getAttribute('data-svcurl');
    const generateUrl = svcUrl + 'generate';
    const validateUrl = svcUrl + 'validate';
    const generateKeysUrl = svcUrl + 'generateKeys';
    const loadKeysUrl = svcUrl + 'loadKeys';
    const saveAppUrl = svcUrl + 'saveApp';
    const getAppsUrl = svcUrl + 'getApps';
    const generateNameUrl = svcUrl + 'generateName';

    const $generateButton = $('.js-generate-btn');
    const $validateButton = $('.js-validate-btn');
    const $generateKeyPairButton = $('.js-generate-key-btn');

    const $newAppButton = $('.js-new-app');
    const $cancelAppButton = $('.js-app-cancel');
    const $saveAppButton = $('.js-app-save');
    const $appNameInput = $('.js-app-name');
    const $appDisplayNameInput = $('.js-app-displayName');
    const $appErrorExistsLabel = $('.js-app-error-exists');
    const $appList = $('#appList');
    const $editAppPanel = $('#editAppPanel');
    const $editAppTitle = $('#editAppTitle');
    const $editAppPrivKey = $('#editAppPrivKey');
    const $editAppPubKey = $('#editAppPubKey');
    const $editAppNotes = $('#editAppNotes');
    const $editNewLicenseBut = $('#editNewLicenseBut');
    const $editSaveBut = $('#editSaveBut');

    const $breadcrumb = $('#breadcrumb');

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

    let editAppId = null;

    $(() => {
        $generateButton.on('click', generateRequest);
        $validateButton.on('click', validateRequest);
        $generateKeyPairButton.on('click', generateKeysRequest);
        $keyPairInput.on('keyup', loadKeysRequest);

        $newAppButton.on('click', newApplication);
        $cancelAppButton.on('click', closeModals);
        $saveAppButton.on('click', saveApplication);
        $editSaveBut.on('click', saveEditedApplication);
        //$editNewLicenseBut.on('click', newLicense);

        $('.modal .delete').on('click', closeModals);
        $('.modal').find('.modal-background').on('click', closeModals);
        var autoGenerateName = debounce(() => generateName($appDisplayNameInput.val()), 800);
        $appDisplayNameInput.on('keyup', autoGenerateName);

        updateBreadcrumb();
        loadApps();
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
        }).done(resp => {
            $licenseInput.val(resp.license);
            $generateButton.prop('disabled', false);

        }).fail(xhr => {
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
        }).done(resp => {
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

        }).fail(xhr => {
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
        }).done(resp => {
            $publicKeyInput.val(resp.publicKey);
            $privateKeyInput.val(resp.privateKey);
            $keyPairInput.val(resp.keyPair);
            $generateKeyPairButton.prop('disabled', false);

        }).fail(xhr => {
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
        }).done(resp => {
            if (resp.publicKey) {
                $publicKeyInput.val(resp.publicKey);
            }
            if (resp.privateKey) {
                $privateKeyInput.val(resp.privateKey);
            }

        }).fail(xhr => {
            console.log('Error');
        });
    }

    // ----
    function loadApps() {
        $.ajax({
            url: getAppsUrl,
            method: "GET",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {}
        }).done(resp => {
            showApps(resp.apps);

        }).fail(xhr => {
            console.log('Error');
        });
    }

    function showApps(apps) {
        console.log(apps);
        let $appRows = [];
        for (let i = 0, l = apps.hits.length; i < l; i++) {
            let app = apps.hits[i];
            let $appRow = $('<a class="panel-block is-active"></a>');
            let $appIcon = $('<span class="panel-icon"></span>');
            let $appI = $('<i class="fas fa-shield-alt"></i>');
            $appIcon.append($appI);
            $appRow.append($appIcon).append(document.createTextNode(' ' + app.displayName));
            $appRow.on('click', {app: app}, onAppRowClick);
            $appRows.push($appRow);
        }

        $appList.find('a.panel-block').remove();
        $appList.append($appRows);
    }

    function onAppRowClick(e) {
        e.preventDefault();
        console.log(e.data.app);
        let app = e.data.app;
        editAppId = app.id;

        $editAppTitle.text(app.displayName);
        $editAppPrivKey.val(app.privateKey);
        $editAppPubKey.val(app.publicKey);
        $editAppNotes.val(app.notes);
        $editAppPanel.show();

        updateBreadcrumb(app.displayName);
    }

    function newApplication(e) {
        e.preventDefault();
        console.log('New application');

        showModal('.js-app-modal');
        $appNameInput.removeClass('is-danger');
        $appDisplayNameInput.removeClass('is-danger');
        $appErrorExistsLabel.addClass('is-invisible');
        $appNameInput.val('');
        $appDisplayNameInput.val('');
        $appDisplayNameInput.focus();
    }

    function saveApplication(e) {
        e.preventDefault();
        var name = $appNameInput.val().trim();
        var displayName = $appDisplayNameInput.val().trim();
        var error = false;
        if (name === '') {
            $appNameInput.addClass('is-danger');
            error = true;
        }
        if (displayName === '') {
            $appDisplayNameInput.addClass('is-danger');
            error = true;
        }
        if (error) {
            return;
        }

        $appNameInput.removeClass('is-danger');
        $appErrorExistsLabel.addClass('is-invisible');

        $saveAppButton.prop('disabled', true);
        $.ajax({
            url: saveAppUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                name: name,
                displayName: displayName
            }
        }).done(resp => {
            $saveAppButton.prop('disabled', false);
            if (resp.ok) {
                closeModals();
                loadApps();
            } else {
                $appNameInput.addClass('is-danger');
                $appErrorExistsLabel.removeClass('is-invisible');
            }

        }).fail(xhr => {
            $saveAppButton.prop('disabled', false);
            console.log('Error');
        });
    }

    function saveEditedApplication(e) {
        e.preventDefault();
        let notes = $editAppNotes.val();

        $editSaveBut.prop('disabled', true);
        $.ajax({
            url: saveAppUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                id: editAppId,
                notes: notes
            }
        }).done(resp => {
            $editSaveBut.prop('disabled', false);
            if (resp.ok) {
                loadApps();
            }

        }).fail(xhr => {
            $editSaveBut.prop('disabled', false);
            console.log('Error');
        });
    }

    function updateBreadcrumb(appName) {
        var lis = [];
        var $appsRootIcon = $('<span class="icon is-small"><i class="fas fa-shield-alt" aria-hidden="true"></i></span>');
        var $appsRootText = $('<span>Applications</span>');
        var $appsRootA = $('<a href="#" aria-current="page"></a>').append($appsRootIcon).append($appsRootText);
        var $appsRoot = $('<li/>').append($appsRootA);
        $appsRoot.toggleClass('is-active', !appName);
        lis.push($appsRoot);

        if (appName) {
            var $appRootText = $('<span/>').text(appName);
            var $appRootA = $('<a href="#" aria-current="page"></a>').append($appRootText);
            var $appRoot = $('<li class="is-active"/>').append($appRootA);
            lis.push($appRoot);
        }
//     <li class="is-active"><a href="#" aria-current="applications"><span class="icon is-small"><i class="fas fa-shield-alt" aria-hidden="true"></i></span><span>Applications</span></a></li>
// <li><a href="#"><span class="icon is-small"><i class="fas fa-key"></i></span><span>Licenses</span></a></li>

        $breadcrumb.empty().append(lis);
    }

    function generateName(name) {
        $.ajax({
            url: generateNameUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {name: name}
        }).done(resp => {
            if (resp.name) {
                $appNameInput.val(resp.name);
            }

        }).fail(xhr => {
            console.log('Error');
        });
    }

    function showModal(modalSelector) {
        let $modal = $(modalSelector);
        let $html = $('html');
        $modal.addClass('is-active');
        $html.addClass('is-clipped');
    }

    function closeModals() {
        $('.modal').removeClass('is-active');
        $('html').removeClass('is-clipped');
    }

    var debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };

})(jQuery);