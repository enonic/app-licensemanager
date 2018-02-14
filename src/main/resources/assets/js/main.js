'use strict';
($ => {
    const svcUrl = document.currentScript.getAttribute('data-svcurl');
    const saveAppUrl = svcUrl + 'saveApp';
    const getAppsUrl = svcUrl + 'getApps';
    const generateNameUrl = svcUrl + 'generateName';
    const createLicenseUrl = svcUrl + 'createLicense';
    const deleteLicenseUrl = svcUrl + 'deleteLicense';

    const $newAppButton = $('#newAppBtn');
    const $cancelAppButton = $('#newAppCancelBtn');
    const $saveAppButton = $('#newAppSaveBtn');
    const $appNameInput = $('#newAppName');
    const $appDisplayNameInput = $('#newAppDisplayName');
    const $appErrorExistsLabel = $('#appErrorExists');
    const $appList = $('#appList');
    const $editAppPanel = $('#editAppPanel');
    const $editAppTitle = $('#editAppTitle');
    const $editAppPrivKey = $('#editAppPrivKey');
    const $editAppPubKey = $('#editAppPubKey');
    const $editAppNotes = $('#editAppNotes');
    const $editNewLicenseBut = $('#editNewLicenseBtn');
    const $editSaveBtn = $('#editSaveBtn');
    const $createLicenseBtn = $('#createLicenseBtn');
    const $cancelNewLicenseBtn = $('#newLicCancelBtn');

    const $breadcrumb = $('#breadcrumb');
    const $licIssuedBy = $('#licIssuedBy');
    const $licIssuedTo = $('#licIssuedTo');
    const $licIssueTime = $('#licIssueTime');
    const $licExpirationTime = $('#licExpirationTime');
    const $viewLicensePanel = $('#viewLicensePanel');
    const $viewLicenseIssuedBy = $('#viewLicenseIssuedBy');
    const $viewLicenseIssuedTo = $('#viewLicenseIssuedTo');
    const $viewLicenseIssueDate = $('#viewLicenseIssueDate');
    const $viewLicenseExpiration = $('#viewLicenseExpiration');
    const $viewLicenseText = $('#viewLicenseText');
    const $viewLicenseTitle = $('#viewLicenseTitle');
    const $deleteLicenseBtn = $('#deleteLicenseBtn');
    const $cancelDeleteLicenseBtn = $('#cancelDeleteLicenseBtn');
    const $confirmDeleteLicenseBtn = $('#confirmDeleteLicenseBtn');

    const $notificationPanel = $('#notificationPanel');
    const $notificationMessage = $('#notificationMessage');

    let g_editAppId = null;
    let g_selectedLicense = null;
    let g_notificationTimer = null;

    $(() => {
        $newAppButton.on('click', newApplication);
        $cancelAppButton.on('click', closeModals);
        $cancelNewLicenseBtn.on('click', closeModals);
        $saveAppButton.on('click', saveApplication);
        $editSaveBtn.on('click', saveEditedApplication);
        $editNewLicenseBut.on('click', newLicense);
        $createLicenseBtn.on('click', createLicense);
        $deleteLicenseBtn.on('click', deleteLicenseConfirm);
        $confirmDeleteLicenseBtn.on('click', deleteLicense);
        $cancelDeleteLicenseBtn.on('click', closeModals);

        $('.modal .delete').on('click', closeModals);
        $('.modal').find('.modal-background').on('click', closeModals);
        var autoGenerateName = debounce(() => generateName($appDisplayNameInput.val()), 600);
        $appDisplayNameInput.on('keyup', autoGenerateName);
        $licIssueTime.datepicker({
            autoHide: true,
            format: 'yyyy-mm-dd',
            weekStart: 1,
            date: new Date()
        });
        $licExpirationTime.datepicker({
            autoHide: true,
            format: 'yyyy-mm-dd',
            weekStart: 1,
            date: new Date()
        });
        $(document).keyup(function (e) {
            if (e.keyCode === 27) {
                closeModals();
            }
        });
        updateBreadcrumb();
        loadApps();
    });

    function loadApps() {
        return $.ajax({
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

            showLicenses(app, $appRows);
        }

        $appList.find('a.panel-block').remove();
        $appList.append($appRows);
    }

    function showLicenses(app, $appRows) {
        for (let i = 0, l = app.licenses.length; i < l; i++) {
            let license = app.licenses[i];
            let $licRow = $('<a class="panel-block is-active panel-level2"></a>');
            let $licIcon = $('<span class="panel-icon"></span>');
            let $licI = $('<i class="fas fa-key"></i>');
            $licIcon.append($licI);
            $licRow.append($licIcon).append(document.createTextNode(' ' + license.issuedTo));
            $licRow.on('click', {app: app, license: license}, onLicenseRowClick);
            $appRows.push($licRow);
        }
    }

    function onAppRowClick(e) {
        e.preventDefault();
        console.log(e.data.app);
        let app = e.data.app;
        g_editAppId = app.id;

        $editAppTitle.text(app.displayName);
        $editAppPrivKey.val(app.privateKey);
        $editAppPubKey.val(app.publicKey);
        $editAppNotes.val(app.notes);
        $editAppPanel.show();
        $viewLicensePanel.hide();

        $editAppNotes.focus();

        updateBreadcrumb(app.displayName);
    }

    function onLicenseRowClick(e) {
        e.preventDefault();
        let app = e.data.app;
        let license = e.data.license;
        showLicense(app, license);
    }

    function showLicense(app, license) {
        g_editAppId = app.id;
        g_selectedLicense = license;

        $viewLicenseTitle.text(app.displayName);
        $viewLicenseIssuedBy.val(license.issuedBy);
        $viewLicenseIssuedTo.val(license.issuedTo);
        $viewLicenseIssueDate.val(license.issueTime);
        $viewLicenseExpiration.val(license.expiryTime);
        $viewLicenseText.val(license.license);

        $viewLicensePanel.show();
        $editAppPanel.hide();

        updateBreadcrumb(app.displayName, license.issuedTo);
    }

    function newApplication(e) {
        e.preventDefault();

        showModal('#newAppModal');
        $appNameInput.removeClass('is-danger');
        $appDisplayNameInput.removeClass('is-danger');
        $appErrorExistsLabel.addClass('is-invisible');
        $appNameInput.val('');
        $appDisplayNameInput.val('');
        $appDisplayNameInput.focus();
    }

    function newLicense(e) {
        e.preventDefault();

        showModal('#newLicenseModal');
        // $appNameInput.removeClass('is-danger');
        // $appDisplayNameInput.removeClass('is-danger');
        // $appErrorExistsLabel.addClass('is-invisible');

        $licIssuedBy.val('');
        $licIssuedTo.val('');
        $licIssueTime.val('');
        $licExpirationTime.val('');
        $licIssuedBy.focus();
    }

    function createLicense(e) {
        e.preventDefault();
        let issuedBy = $licIssuedBy.val();
        let issuedTo = $licIssuedTo.val();
        let issueTime = $licIssueTime.val();
        let expirationTime = $licExpirationTime.val();

        $createLicenseBtn.prop('disabled', true);
        $.ajax({
            url: createLicenseUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                id: g_editAppId,
                issuedBy: issuedBy,
                issuedTo: issuedTo,
                issueTime: issueTime,
                expirationTime: expirationTime
            }
        }).done(resp => {
            $createLicenseBtn.prop('disabled', false);
            if (resp.ok) {
                closeModals();
                showNotification('License created.');

                let licId = resp.license;
                loadApps().then((resp) => {
                    let apps = resp.apps;

                    licenseLookup:
                        for (let a = 0; a < apps.hits.length; a++) {
                            let app = apps.hits[a];
                            for (let l = 0; l < app.licenses.length; l++) {
                                let license = app.licenses[l];
                                if (license.id === licId) {
                                    showLicense(app, license);
                                    break licenseLookup;
                                }
                            }
                        }
                });

            }

        }).fail(xhr => {
            $createLicenseBtn.prop('disabled', false);
            console.log('Error');
        });
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
                showNotification('Application created.');
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

        $editSaveBtn.prop('disabled', true);
        $.ajax({
            url: saveAppUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                id: g_editAppId,
                notes: notes
            }
        }).done(resp => {
            $editSaveBtn.prop('disabled', false);
            if (resp.ok) {
                showNotification('Application changes saved.');
                loadApps();
            }

        }).fail(xhr => {
            $editSaveBtn.prop('disabled', false);
            console.log('Error');
        });
    }

    function deleteLicenseConfirm(e) {
        showModal('#deleteLicenseModal');
    }

    function deleteLicense(e) {
        e.preventDefault();
        $confirmDeleteLicenseBtn.prop('disabled', true);
        $.ajax({
            url: deleteLicenseUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                id: g_selectedLicense.id
            }
        }).done(resp => {
            $confirmDeleteLicenseBtn.prop('disabled', false);
            showNotification('The license has been deleted.');
            closeModals();
            loadApps();
            $viewLicensePanel.hide();

        }).fail(xhr => {
            $confirmDeleteLicenseBtn.prop('disabled', false);
            console.log('Error');
        });
    }

    function updateBreadcrumb(appName, licenseName) {
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
            var $appRoot = $('<li/>').append($appRootA).toggleClass('is-active', !licenseName);
            lis.push($appRoot);
        }

        if (licenseName) {
            var $licsRootIcon = $('<span class="icon is-small"><i class="fas fa-key" aria-hidden="true"></i></span>');
            var $licsRootText = $('<span>Licenses</span>');
            var $licsRootA = $('<a href="#" aria-current="page"></a>').append($licsRootIcon).append($licsRootText);
            var $licsRoot = $('<li/>').append($licsRootA);
            lis.push($licsRoot);

            var $licenseRootText = $('<span/>').text(licenseName);
            var $licenseRootA = $('<a href="#" aria-current="page"></a>').append($licenseRootText);
            var $licenseRoot = $('<li class="is-active"/>').append($licenseRootA);
            lis.push($licenseRoot);
        }

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

    function showNotification(message) {
        $notificationMessage.text(message);
        $notificationPanel.show();
        clearTimeout(g_notificationTimer);
        g_notificationTimer = setTimeout(() => $notificationPanel.fadeOut('slow'), 3000);
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