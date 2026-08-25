'use strict';

const path = require('path');
const { GUI, TABS } = require('./../js/gui');
const i18n = require('./../js/localization');

require('./osd');
require('./sensors');

TABS.my_tab = {};

TABS.my_tab.initialize = function (callback) {
    if (GUI.active_tab != 'my_tab') {
        GUI.active_tab = 'my_tab';
    }

    GUI.load(path.join(__dirname, "my_tab.html"), function () {
        
        try {
            if (typeof TABS.osd !== 'undefined' && TABS.osd.initialize) {
                TABS.osd.initialize(function() {
                    console.log('OSD initialized inside my_tab');
                });
            }
        } catch (e) {
            console.warn('OSD init error (probably no connection):', e.message);
        }

        i18n.localize();

        setupSubtabSwitching();

        GUI.content_ready(callback);
    });
};

function setupSubtabSwitching() {
    function hideAllSubtabs() {
        $('.subtab-content').hide();
        $('.subtab-header-label').removeClass('active');
    }

    function showSubtab(subtabId) {
        $('#' + subtabId).show();
        $('.subtab-header-label[for="' + subtabId + '"]').addClass('active');
    }

    $('.subtab-header-label').on('click', function() {
        var subtabId = $(this).attr('for');
        hideAllSubtabs();
        showSubtab(subtabId);
    });

    hideAllSubtabs();
    showSubtab('osd-content');
}

TABS.my_tab.cleanup = function (callback) {
    if (callback) callback();
};