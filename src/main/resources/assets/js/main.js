'use strict';
($ => {
    const svcUrl = document.currentScript.getAttribute('data-svcurl');
    const saveAppUrl = svcUrl + 'saveApp';
    const getAppsUrl = svcUrl + 'getApps';
    const createLicenseUrl = svcUrl + 'createLicense';
    const deleteLicenseUrl = svcUrl + 'deleteLicense';
    const deleteAppUrl = svcUrl + 'deleteApp';

    const $newAppButton = $('#newAppBtn');
    const $cancelAppButton = $('#newAppCancelBtn');
    const $saveAppButton = $('#newAppSaveBtn');
    const $appDisplayNameInput = $('#newAppDisplayName');
    const $newAppNotes = $('#newAppNotes');
    const $appList = $('#appList');
    const $editAppPanel = $('#editAppPanel');
    const $editAppTitle = $('#editAppTitle');
    const $editAppPrivKey = $('#editAppPrivKey');
    const $editAppPubKey = $('#editAppPubKey');
    const $editAppNotes = $('#editAppNotes');
    const $editNewLicenseBtn = $('#editNewLicenseBtn');
    const $editSaveBtn = $('#editSaveBtn');
    const $deleteAppBtn = $('#deleteAppBtn');
    const $confirmDeleteApplicationBtn = $('#confirmDeleteApplicationBtn');
    const $cancelDeleteApplicationBtn = $('#cancelDeleteApplicationBtn');
    const $createLicenseBtn = $('#createLicenseBtn');
    const $cancelNewLicenseBtn = $('#newLicCancelBtn');
    const $copyPrivateKeyBtn = $('#copyPrivateKeyBtn');
    const $copyPublicKeyBtn = $('#copyPublicKeyBtn');
    const $licenseTable = $('#licenseTable');

    const $breadcrumb = $('#breadcrumb');
    const $licIssuedBy = $('#licIssuedBy');
    const $licIssuedTo = $('#licIssuedTo');
    const $licIssueTime = $('#licIssueTime');
    const $licExpirationTime = $('#licExpirationTime');
    const $viewLicenseIssuedBy = $('#viewLicenseIssuedBy');
    const $viewLicenseIssuedTo = $('#viewLicenseIssuedTo');
    const $viewLicenseIssueDate = $('#viewLicenseIssueDate');
    const $viewLicenseExpiration = $('#viewLicenseExpiration');
    const $viewLicenseText = $('#viewLicenseText');
    const $deleteLicenseBtn = $('#deleteLicenseBtn');
    const $cancelDeleteLicenseBtn = $('#cancelDeleteLicenseBtn');
    const $confirmDeleteLicenseBtn = $('#confirmDeleteLicenseBtn');

    const $searchText = $('#searchText');

    const $notificationPanel = $('#notificationPanel');
    const $notificationMessage = $('#notificationMessage');

    const GenericErrorMessage = 'Oops! Something went wrong!';

    let g_editAppId = null;
    let g_selectedLicense = null;
    let g_notificationTimer = null;

    $(() => {
        $newAppButton.on('click', newApplication);
        $cancelAppButton.on('click', closeModals);
        $cancelNewLicenseBtn.on('click', closeModals);
        $saveAppButton.on('click', saveApplication);
        $editSaveBtn.on('click', saveEditedApplication);
        $deleteAppBtn.on('click', deleteAppConfirm);
        $confirmDeleteApplicationBtn.on('click', deleteApp);
        $editNewLicenseBtn.on('click', newLicense);
        $createLicenseBtn.on('click', createLicense);
        $deleteLicenseBtn.on('click', deleteLicenseConfirm);
        $confirmDeleteLicenseBtn.on('click', deleteLicense);
        $cancelDeleteLicenseBtn.on('click', closeModals);
        $cancelDeleteApplicationBtn.on('click', closeModals);
        $copyPrivateKeyBtn.on('click', copyPrivateKeyClipboard);
        $copyPublicKeyBtn.on('click', copyPublicKeyClipboard);

        new Clipboard('#copyPrivateKeyBtn,#copyPublicKeyBtn');

        $('.modal .delete').on('click', closeModals);
        $('.modal').find('.modal-background').on('click', closeModals);
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
            showNotificationError(GenericErrorMessage);
        });
    }

    function showApps(apps) {
        let $appRows = [];
        for (let i = 0, l = apps.hits.length; i < l; i++) {
            let app = apps.hits[i];
            let $appRow = $('<a class="panel-block" style="justify-content: space-between;"></a>');
            let $divWrapper = $('<div>');
            let $appIcon = $('<span class="panel-icon"></span>');
            let $appI = $('<i class="fas fa-shield-alt"></i>');


            $appIcon.append($appI);
            $divWrapper.append($appIcon).append(document.createTextNode(' ' + app.displayName));
            $appRow.append($divWrapper);
            if (app.licenses.length > 0) {
                let $licCount = $('<span class="tag is-small is-rounded is-link"/>').text(app.licenses.length);
                $appRow.append($licCount);
            }

            $appRow.on('click', {app: app}, onAppRowClick);
            $appRows.push($appRow);
        }

        $appList.find('a.panel-block').remove();
        $appList.append($appRows);
    }

    function showLicenses(app) {
        let rows = [];
        for (let i = 0, l = app.licenses.length; i < l; i++) {
            let license = app.licenses[i];
            let $licRow = $('<tr>');
            let $issuedBy = $('<td/>').text(license.issuedBy);
            let $issuedTo = $('<td/>').text(license.issuedTo);
            let $issueDate = $('<td/>').text(formatDate(license.issueTime));
            let $expiration = $('<td/>').text(formatDate(license.expiryTime));
            $licRow.append($issuedBy).append($issuedTo).append($issueDate).append($expiration);
            $licRow.on('click', {app: app, license: license}, onLicenseRowClick);
            rows.push($licRow);
        }
        $licenseTable.empty().append(rows);
    }

    function onAppRowClick(e) {
        e.preventDefault();
        let $row = $(this);
        $row.siblings().removeClass('is-active');
        $row.addClass('is-active');

        let app = e.data.app;
        showApp(app);
    }

    function onLicenseRowClick(e) {
        e.preventDefault();
        let $row = $(this);
        $row.siblings().removeClass('is-active');
        $row.addClass('is-active');

        let app = e.data.app;
        let license = e.data.license;
        showLicense(app, license);
    }

    function showApp(app) {
        g_editAppId = app.id;

        $editAppTitle.text(app.displayName);
        $editAppPrivKey.val(app.privateKey);
        $editAppPubKey.val(app.publicKey);
        $editAppNotes.val(app.notes);
        $editAppPanel.show();

        $editAppNotes.focus();

        showLicenses(app);

        updateBreadcrumb(app.displayName);
    }

    function showLicense(app, license) {
        g_editAppId = app.id;
        g_selectedLicense = license;

        $viewLicenseIssuedBy.val(license.issuedBy);
        $viewLicenseIssuedTo.val(license.issuedTo);
        $viewLicenseIssueDate.val(formatDate(license.issueTime));
        $viewLicenseExpiration.val(formatDate(license.expiryTime));
        $viewLicenseText.val(license.license);

        showModal('#viewLicenseModal');

        updateBreadcrumb(app.displayName);
    }

    function newApplication(e) {
        e.preventDefault();

        showModal('#newAppModal');
        $appDisplayNameInput.removeClass('is-danger');
        $appDisplayNameInput.val('');
        $newAppNotes.val('');
        $appDisplayNameInput.focus();
    }

    function newLicense(e) {
        e.preventDefault();

        showModal('#newLicenseModal');

        var t = new Date();
        var t2 = new Date();
        t2.setFullYear(t2.getFullYear() + 1);

        $licIssuedBy.val('');
        $licIssuedTo.val('');
        $licIssueTime.val(t.toISOString().substring(0, 10));
        $licExpirationTime.val(t2.toISOString().substring(0, 10));

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

                    for (let a = 0; a < apps.hits.length; a++) {
                        let app = apps.hits[a];
                        if (app.id === g_editAppId) {
                            showApp(app);
                        }
                    }
                });

            }

        }).fail(xhr => {
            $createLicenseBtn.prop('disabled', false);
            showNotificationError(GenericErrorMessage);
        });
    }

    function saveApplication(e) {
        e.preventDefault();
        let displayName = $appDisplayNameInput.val().trim();
        let notes = $newAppNotes.val();
        let error = false;
        if (displayName === '') {
            $appDisplayNameInput.addClass('is-danger');
            error = true;
        }
        if (error) {
            return;
        }

        $appDisplayNameInput.removeClass('is-danger');

        $saveAppButton.prop('disabled', true);
        $.ajax({
            url: saveAppUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                displayName: displayName,
                notes: notes
            }
        }).done(resp => {
            $saveAppButton.prop('disabled', false);
            if (resp.ok) {
                closeModals();
                loadApps();
                showNotification('Application created.');
            } else {
                $appDisplayNameInput.addClass('is-danger');
            }

        }).fail(xhr => {
            $saveAppButton.prop('disabled', false);
            showNotificationError(GenericErrorMessage);
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
            showNotificationError(GenericErrorMessage);
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
            loadApps().then((resp) => {
                let apps = resp.apps;

                for (let a = 0; a < apps.hits.length; a++) {
                    let app = apps.hits[a];
                    if (app.id === g_editAppId) {
                        showApp(app);
                    }
                }
            });

        }).fail(xhr => {
            $confirmDeleteLicenseBtn.prop('disabled', false);
            showNotificationError(GenericErrorMessage);
        });
    }

    function deleteAppConfirm(e) {
        showModal('#deleteApplicationModal');
    }

    function deleteApp(e) {
        e.preventDefault();
        $confirmDeleteApplicationBtn.prop('disabled', true);
        $.ajax({
            url: deleteAppUrl,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                id: g_editAppId
            }
        }).done(resp => {
            $confirmDeleteApplicationBtn.prop('disabled', false);
            showNotification('The application has been deleted.');
            closeModals();
            loadApps();
            $editAppPanel.hide();
            g_editAppId = null;

        }).fail(xhr => {
            $confirmDeleteApplicationBtn.prop('disabled', false);
            showNotificationError(GenericErrorMessage);
        });
    }

    function copyPrivateKeyClipboard(e) {
        e.preventDefault();
        showNotificationWarning('Private key copied to clipboard.');
    }

    function copyPublicKeyClipboard(e) {
        e.preventDefault();
        showNotificationWarning('Public key copied to clipboard.');
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
            var $appRoot = $('<li/>').append($appRootA).addClass('is-active');
            lis.push($appRoot);
        }

        $breadcrumb.empty().append(lis);
    }

    function showNotificationWarning(message) {
        showNotification(message, 'warning');
    }

    function showNotificationError(message) {
        showNotification(message, 'error');
    }

    function showNotification(message, type) {
        var isWarning = type === 'warning';
        var isError = type === 'error';
        var isInfo = !isWarning && !isError;
        $notificationMessage.text(message);
        $notificationPanel.show();
        $notificationPanel.toggleClass('is-info', isInfo).toggleClass('is-warning', isWarning).toggleClass('is-danger', isError);
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

    function formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : '';
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