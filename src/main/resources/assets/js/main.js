'use strict';
($ => {
    const svcUrl = document.currentScript.getAttribute('data-svcurl');
    const saveAppUrl = svcUrl + 'saveApp';
    const getAppsUrl = svcUrl + 'getApps';
    const getLicensesUrl = svcUrl + 'getLicenses';
    const createLicenseUrl = svcUrl + 'createLicense';
    const deleteLicenseUrl = svcUrl + 'deleteLicense';
    const deleteAppUrl = svcUrl + 'deleteApp';
    const downloadLicenseUrl = svcUrl + 'downloadLicense';

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
    const $downloadLicenseBtn = $('#downloadLicenseBtn');

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
        $cancelDeleteLicenseBtn.on('click', closeModal);
        $cancelDeleteApplicationBtn.on('click', closeModals);
        $copyPrivateKeyBtn.on('click', copyPrivateKeyClipboard);
        $copyPublicKeyBtn.on('click', copyPublicKeyClipboard);
        $searchText.on('keyup', onSearchTyping);

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
            data: {
                search: $searchText.val().trim()
            }
        }).done(resp => {
            showApps(resp.apps);

        }).fail(xhr => {
            showNotificationError(GenericErrorMessage);
        });
    }

    function loadLicenses(appId) {
        return $.ajax({
            url: getLicensesUrl,
            method: "GET",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {id: appId}
        }).done(resp => {

        }).fail(xhr => {
            showNotificationError(GenericErrorMessage);
        });
    }

    function showCurrentApp(resp) {
        let apps = resp.apps;

        for (let a = 0; a < apps.hits.length; a++) {
            let app = apps.hits[a];
            if (app.id === g_editAppId) {
                showApp(app);
            }
        }
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
            if (app.id === g_editAppId) {
                $appRow.addClass('is-active');
            }
            if (app.licenseCount > 0) {
                let $licCount = $('<span class="tag is-small is-rounded is-link"/>').text(app.licenseCount);
                $appRow.append($licCount);
            }

            $appRow.on('click', {app: app}, onAppRowClick);
            $appRows.push($appRow);
        }

        $appList.find('a.panel-block').remove();
        $appList.append($appRows);
    }

    function showLicenses(app, licenses) {
        let rows = [];
        for (let i = 0, l = licenses.length; i < l; i++) {
            let license = licenses[i];
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

        $licenseTable.empty();
        loadLicenses(app.id).then((resp) => {
            showLicenses(app, resp.licenses.hits);
        });

        $editAppTitle.text(app.displayName);
        $editAppPrivKey.val(app.privateKey);
        $editAppPubKey.val(app.publicKey);
        $editAppNotes.val(app.notes);
        $editAppPanel.show();

        $editAppNotes.focus();

        updateBreadcrumb(app.displayName);
    }

    function unselectApp() {
        g_editAppId = null;
        g_selectedLicense = null;
        $editAppPanel.hide();
        updateBreadcrumb();
        $searchText.val('');
        loadApps();
    }

    function showLicense(app, license) {
        g_editAppId = app.id;
        g_selectedLicense = license;

        $viewLicenseIssuedBy.val(license.issuedBy);
        $viewLicenseIssuedTo.val(license.issuedTo);
        $viewLicenseIssueDate.val(formatDate(license.issueTime));
        $viewLicenseExpiration.val(formatDate(license.expiryTime));
        $viewLicenseText.val(license.license);

        let downloadUrl = downloadLicenseUrl + '?id=' + g_selectedLicense.id;
        $downloadLicenseBtn.attr('href', downloadUrl);

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

        let t = new Date();
        let t2 = new Date();
        t2.setFullYear(t2.getFullYear() + 1);

        $licIssuedBy.removeClass('is-danger');
        $licIssuedTo.removeClass('is-danger');
        $licIssueTime.removeClass('is-danger');
        $licExpirationTime.removeClass('is-danger');

        $licIssuedBy.val('');
        $licIssuedTo.val('');
        $licIssueTime.val(t.toISOString().substring(0, 10));
        $licExpirationTime.val(t2.toISOString().substring(0, 10));

        $licIssuedBy.focus();
    }

    function createLicense(e) {
        e.preventDefault();
        $licIssuedBy.removeClass('is-danger');
        $licIssuedTo.removeClass('is-danger');
        $licIssueTime.removeClass('is-danger');
        $licExpirationTime.removeClass('is-danger');

        let issuedBy = $licIssuedBy.val().trim();
        let issuedTo = $licIssuedTo.val().trim();
        let issueTime = $licIssueTime.val();
        let expirationTime = $licExpirationTime.val();
        let issueDate = parseDate(issueTime);
        let expirationDate = parseDate(expirationTime);

        let error = false;
        if (issuedBy === '') {
            $licIssuedBy.addClass('is-danger');
            error = true;
        }
        if (issuedTo === '') {
            $licIssuedTo.addClass('is-danger');
            error = true;
        }
        if (issueTime && !issueDate) {
            $licIssueTime.addClass('is-danger');
            error = true;
        }
        if (expirationTime && !expirationDate) {
            $licExpirationTime.addClass('is-danger');
            error = true;
        }
        if (expirationDate && issueDate && (issueDate.getTime() >= expirationDate.getTime())) {
            $licIssueTime.addClass('is-danger');
            $licExpirationTime.addClass('is-danger');
            error = true;
        }
        if (error) {
            return;
        }

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

                loadApps().then(showCurrentApp);
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
                showNotification('Application created.');
                g_editAppId = resp.id;
                loadApps().then(showCurrentApp);
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
                loadApps().then(showCurrentApp);
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
            loadApps().then(showCurrentApp);

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

    function onSearchTyping(e) {
        var code = e.which;
        if (code === 13) {
            e.preventDefault();
            var searchText = $searchText.val();
            loadApps();
        }
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
        let lis = [];
        let $appsRootIcon = $('<span class="icon is-small"><i class="fas fa-shield-alt" aria-hidden="true"></i></span>');
        let $appsRootText = $('<span>Applications</span>');
        let $appsRootA = $('<a href="#" aria-current="page"></a>').append($appsRootIcon).append($appsRootText);
        let $appsRoot = $('<li/>').append($appsRootA);
        $appsRoot.toggleClass('is-active', !appName);
        $appsRoot.on('click', unselectApp);
        lis.push($appsRoot);

        if (appName) {
            let $appRootText = $('<span/>').text(appName);
            let $appRootA = $('<a href="#" aria-current="page"></a>').append($appRootText);
            let $appRoot = $('<li/>').append($appRootA).addClass('is-active');
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
        let isWarning = type === 'warning';
        let isError = type === 'error';
        let isInfo = !isWarning && !isError;
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

    function closeModal(e) {
        e && e.preventDefault();
        $(this).closest('.modal').removeClass('is-active');
        $('html').removeClass('is-clipped');
    }

    function closeModals(e) {
        e && e.preventDefault();
        $('.modal').removeClass('is-active');
        $('html').removeClass('is-clipped');
    }

    function formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : '';
    }

    function parseDate(dateVal) {
        dateVal = dateVal.trim();
        if (!dateVal.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/)) {
            return null;
        }
        let parts = dateVal.split('-');
        if (parts.length !== 3) {
            return null;
        }
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

})(jQuery);