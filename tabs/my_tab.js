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

        setupSubtabSwitching();

        initEmbeddedTab('osd', 'osd.html', '.tab-osd');
        initEmbeddedTab('sensors', 'sensors.html', '.tab-sensors');

        fixOsdPreviewPosition();

        i18n.localize();
        GUI.content_ready(callback);
    });
};


function initEmbeddedTab(tabName, htmlFileName, rootSelector) {
    const tab = TABS[tabName];
    if (!tab || typeof tab.initialize !== 'function') {
        console.warn(tabName + ': TABS.' + tabName + '.initialize ');
        return;
    }

    const $root = $(rootSelector);
    if (!$root.length) {
        console.warn(tabName + ': (' + rootSelector + ') my_tab.html');
        return;
    }

    const originalGUILoad = GUI.load;
    let restored = false;

    function restore() {
        if (!restored) {
            restored = true;
            GUI.load = originalGUILoad;
        }
    }

    const safetyTimer = setTimeout(function () {
        console.error(tabName + ': initialize ');
        restore();
    }, 8000);

    GUI.load = function (filePath, cb) {
        if (typeof filePath === 'string' && filePath.indexOf(htmlFileName) !== -1) {
            restore();
            clearTimeout(safetyTimer);

            if (typeof cb === 'function') {
                try {
                    cb($root);
                } catch (e1) {
                    console.warn(tabName + ': cb($root) cb():', e1.message);
                    try {
                        cb();
                    } catch (e2) {
                        console.error(tabName + ': callback GUI.load', e2);
                    }
                }
            }
            return;
        }
        originalGUILoad.apply(GUI, arguments);
    };

    try {
        tab.initialize(function () {
            clearTimeout(safetyTimer);
            restore();
            console.log(tabName + ' initialized (embedded)');
        });
    } catch (e) {
        clearTimeout(safetyTimer);
        restore();
        console.error(tabName + ': initialize', e);
    }
}

let osdPreviewObserver = null;

function fixOsdPreviewPosition() {
    const $preview = $('.tab-osd .gui_box.preview');
    const $wrapper = $('.tab-osd .content_wrapper');

    if (!$preview.length || !$wrapper.length) {
        console.warn('fixOsdPreviewPosition:');
        return;
    }

    $wrapper.css('position', 'relative');

    const wrapperWidth = $wrapper.width();
    const previewWidth = $preview.outerWidth();
    const leftPx = Math.max(0, (wrapperWidth - previewWidth) / 2);

    const $thirdLeft = $('.tab-osd .third_left');
    const topPx = $thirdLeft.length ? $thirdLeft.position().top : 0;

    $preview.css({
        position: 'absolute',
        top: topPx + 'px',
        left: leftPx + 'px',
        float: 'none'
    });
}

function setupSubtabSwitching() {
    function hideAllSubtabs() {
        $('.subtab-content').hide();
        $('.subtab-header-label').removeClass('active');
    }

    function showSubtab(subtabId) {
        $('#' + subtabId).show();
        $('.subtab-header-label[for="' + subtabId + '"]').addClass('active');
    }

    $('.subtab-header-label').off('click').on('click', function() {
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