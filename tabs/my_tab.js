'use strict';

const path = require('path');
const { GUI, TABS } = require('./../js/gui');

TABS.my_tab = {};

TABS.my_tab.initialize = function (callback) {
    if (GUI.active_tab != 'my_tab') {
        GUI.active_tab = 'my_tab';
    }

    GUI.load(path.join(__dirname, "my_tab.html"), function () {
        
        if (typeof TABS.osd !== 'undefined' && TABS.osd.initialize) {
            TABS.osd.initialize(function() {
                console.log('OSD initialized inside my_tab');
                if (typeof TABS.osd.updateData === 'function') {
                    TABS.osd.updateData();
                }
            });
        }

        if (typeof TABS.sensors !== 'undefined' && TABS.sensors.initialize) {
            TABS.sensors.initialize(function() {
                console.log('SENSORS initialized inside my_tab');
                if (typeof TABS.sensors.updateData === 'function') {
                    TABS.sensors.updateData();
                }
            });
        }

        setupSubtabSwitching();

        subscribeToDataUpdates();

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

function subscribeToDataUpdates() {
    $(document).on('msp-data-update', function() {
        console.log('Data update received in my_tab');
        if (typeof TABS.osd !== 'undefined' && typeof TABS.osd.updateData === 'function') {
            TABS.osd.updateData();
        }
        if (typeof TABS.sensors !== 'undefined' && typeof TABS.sensors.updateData === 'function') {
            TABS.sensors.updateData();
        }
    });
}

TABS.my_tab.cleanup = function (callback) {
    $(document).off('msp-data-update');
    if (callback) callback();
};