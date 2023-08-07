/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 47525:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(93150);
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__);


// Sign up at https://extensionpay.com to use this library. AGPLv3 licensed.


// For running as a content script. Receive a message from the successful payments page
// and pass it on to the background page to query if the user has paid.
if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
        if (event.origin !== 'https://extensionpay.com') return;
        if (event.source != window) return;
        if (event.data === 'fetch-user' || event.data === 'trial-start') {
            webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage(event.data);
        }
    }, false);
}

function ExtPay(extension_id) {

    const HOST = `https://extensionpay.com`;
    const EXTENSION_URL = `${HOST}/extension/${extension_id}`;

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function get(key) {
        try {
            return await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.storage.sync.get(key)
        } catch(e) {
            // if sync not available (like with Firefox temp addons), fall back to local
            return await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.storage.local.get(key)
        }
    }
    async function set(dict) {
        try {
            return await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.storage.sync.set(dict)
        } catch(e) {
            // if sync not available (like with Firefox temp addons), fall back to local
            return await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.storage.local.set(dict)
        }
    }

    // ----- start configuration checks
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.management && webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.management.getSelf().then(async (ext_info) => {
        if (!ext_info.permissions.includes('storage')) {
            var permissions = ext_info.hostPermissions.concat(ext_info.permissions);
            throw `ExtPay Setup Error: please include the "storage" permission in manifest.json["permissions"] or else ExtensionPay won't work correctly.

You can copy and paste this to your manifest.json file to fix this error:

"permissions": [
    ${permissions.map(x => `"    ${x}"`).join(',\n')}${permissions.length > 0 ? ',' : ''}
    "storage"
]
`
        }

    });
    // ----- end configuration checks

    // run on "install"
    get(['extensionpay_installed_at', 'extensionpay_user']).then(async (storage) => {
        if (storage.extensionpay_installed_at) return;

        // Migration code: before v2.1 installedAt came from the server
        // so use that stored datetime instead of making a new one.
        const user = storage.extensionpay_user;
        const date = user ? user.installedAt : (new Date()).toISOString();
        await set({'extensionpay_installed_at': date});
    });

    const paid_callbacks = [];
    const trial_callbacks =  [];

    async function create_key() {
        var body = {};
        var ext_info;
        if (webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.management) {
            ext_info = await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.management.getSelf();
        } else if (webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime) {
            ext_info = await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage('extpay-extinfo'); // ask background page for ext info
        } else {
            throw 'ExtPay needs to be run in a browser extension context'
        }

        if (ext_info.installType == 'development') {
            body.development = true;
        } 

        const resp = await fetch(`${EXTENSION_URL}/api/new-key`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!resp.ok) {
            throw resp.status, `${HOST}/home`
        }
        const api_key = await resp.json();
        await set({extensionpay_api_key: api_key});
        return api_key;
    }

    async function get_key() {
        const storage = await get(['extensionpay_api_key']);
        if (storage.extensionpay_api_key) {
            return storage.extensionpay_api_key;
        }
        return null;
    }

    const datetime_re = /^\d\d\d\d-\d\d-\d\dT/;

    async function fetch_user() {
        var storage = await get(['extensionpay_user', 'extensionpay_installed_at']);
        const api_key = await get_key();
        if (!api_key) {
            return {
                paid: false,
                paidAt: null,
                installedAt: storage.extensionpay_installed_at ? new Date(storage.extensionpay_installed_at) : new Date(), // sometimes this function gets called before the initial install time can be flushed to storage
                trialStartedAt: null,
            }
        }

        const resp = await fetch(`${EXTENSION_URL}/api/user?api_key=${api_key}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        // TODO: think harder about error states and what users will want (bad connection, server error, id not found)
        if (!resp.ok) throw 'ExtPay error while fetching user: '+(await resp.text())

        const user_data = await resp.json();

        const parsed_user = {};
        for (var [key, value] of Object.entries(user_data)) {
            if (value && value.match && value.match(datetime_re)) {
                value = new Date(value);
            }
            parsed_user[key] = value;
        }
        parsed_user.installedAt = new Date(storage.extensionpay_installed_at);
          

        if (parsed_user.paidAt) {
            if (!storage.extensionpay_user || (storage.extensionpay_user && !storage.extensionpay_user.paidAt)) {
                paid_callbacks.forEach(cb => cb(parsed_user));
            }
        }
        if (parsed_user.trialStartedAt) {
            if (!storage.extensionpay_user || (storage.extensionpay_user && !storage.extensionpay_user.trialStartedAt)) {
                trial_callbacks.forEach(cb => cb(parsed_user));
            }

        }
        await set({extensionpay_user: user_data});

        return parsed_user;
    }

    async function payment_page_link() {
        var api_key = await get_key();
        if (!api_key) {
            api_key = await create_key();
        }
        return `${EXTENSION_URL}?api_key=${api_key}`
    }

    async function open_popup(url, width, height) {
        if (webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.windows) {
            const current_window = await webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.windows.getCurrent();
            // https://stackoverflow.com/a/68456858
            const left = Math.round((current_window.width - width) * 0.5 + current_window.left);
            const top = Math.round((current_window.height - height) * 0.5 + current_window.top);
            try {
                webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.windows.create({
                    url: url,
                    type: "popup",
                    focused: true,
                    width,
                    height,
                    left,
                    top
                });
            } catch(e) {
                // firefox doesn't support 'focused'
                webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.windows.create({
                    url: url,
                    type: "popup",
                    width,
                    height,
                    left,
                    top
                });
            }
        } else {
            // for opening from a content script
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/open
            window.open(url, null, `toolbar=no,location=no,directories=no,status=no,menubar=no,width=${width},height=${height},left=450`);
        }
    }

    async function open_payment_page() {
        const url = await payment_page_link();
        open_popup(url, 500, 800);
    }

    async function open_trial_page(period) {
        // let user have period string like '1 week' e.g. "start your 1 week free trial"

        var api_key = await get_key();
        if (!api_key) {
            api_key = await create_key();
        }
        var url = `${EXTENSION_URL}/trial?api_key=${api_key}`;
        if (period) {
            url += `&period=${period}`;
        }
        open_popup(url, 500, 650);
    }
    async function open_login_page() {
        var api_key = await get_key();
        if (!api_key) {
            api_key = await create_key();
        }
        const url = `${EXTENSION_URL}/reactivate?api_key=${api_key}`;
        open_popup(url, 500, 800);
    }

    var polling = false;
    async function poll_user_paid() {
        // keep trying to fetch user in case stripe webhook is late
        if (polling) return;
        polling = true;
        var user = await fetch_user();
        for (var i=0; i < 2*60; ++i) {
            if (user.paidAt) {
                polling = false;
                return user;
            }
            await timeout(1000);
            user = await fetch_user();
        }
        polling = false;
    }


    
    return {
        getUser: function() {
            return fetch_user()
        },
        onPaid: {
            addListener: function(callback) {
                const content_script_template = `"content_scripts": [
                {
            "matches": ["${HOST}/*"],
            "js": ["ExtPay.js"],
            "run_at": "document_start"
        }]`;
                const manifest = webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.getManifest();
                if (!manifest.content_scripts) {
                    throw `ExtPay setup error: To use the onPaid callback handler, please include ExtPay as a content script in your manifest.json. You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson

        ${content_script_template}`
                }
                const extpay_content_script_entry = manifest.content_scripts.find(obj => {
                    // removing port number because firefox ignores content scripts with port number
                    return obj.matches.includes(HOST.replace(':3000', '')+'/*')
                });
                if (!extpay_content_script_entry) {
                    throw `ExtPay setup error: To use the onPaid callback handler, please include ExtPay as a content script in your manifest.json matching "${HOST}/*". You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson

        ${content_script_template}`
                } else {
                    if (!extpay_content_script_entry.run_at || extpay_content_script_entry.run_at !== 'document_start') {
                        throw `ExtPay setup error: To use the onPaid callback handler, please make sure the ExtPay content script in your manifest.json runs at document start. You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson

        ${content_script_template}`
                    }
                }

                paid_callbacks.push(callback);
            },
            // removeListener: function(callback) {
            //     // TODO
            // }
        },
        openPaymentPage: open_payment_page,
        openTrialPage: open_trial_page,
        openLoginPage: open_login_page,
        onTrialStarted: {
            addListener: function(callback) {
                trial_callbacks.push(callback);
            }
        },
        startBackground: function() {
            webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.onMessage.addListener(function(message, sender, send_response) {
                console.log('service worker got message! Here it is:', message);
                if (message == 'fetch-user') {
                    // Only called via extensionpay.com/extension/[extension-id]/paid -> content_script when user successfully pays.
                    // It's possible attackers could trigger this but that is basically harmless. It would just query the user.
                    poll_user_paid();
                } else if (message == 'trial-start') {
                    // no need to poll since the trial confirmation page has already set trialStartedAt
                    fetch_user(); 
                } else if (message == 'extpay-extinfo' && webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.management) {
                    // get this message from content scripts which can't access browser.management
                    return webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.management.getSelf()
                }
            });
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ExtPay);


/***/ }),

/***/ 8555:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAllStoredSync = exports.storeActiveGamepadConfig = exports.storeGlobalPrefs = exports.storeGamepadConfigEnabled = exports.deleteGamepadConfig = exports.storeGamepadConfig = exports.storeSeenOnboarding = exports.getLocalGameStatus = exports.updateGameName = void 0;
const gamepadConfig_1 = __webpack_require__(4053);
const defaults_1 = __webpack_require__(53201);
// Chrome Sync Storage Limits:
// max items = 512
// max writes per second = 2
// max bytes per item = 8.192 KB
var LocalStorageKeys;
(function (LocalStorageKeys) {
    LocalStorageKeys["GAME_NAME"] = "GAME_NAME";
})(LocalStorageKeys || (LocalStorageKeys = {}));
var SyncStorageKeys;
(function (SyncStorageKeys) {
    SyncStorageKeys["GAMEPAD_CONFIGS"] = "GP_CONF";
    SyncStorageKeys["ACTIVE_GAMEPAD_CONFIG"] = "ACTIVE_GP_CONF";
    SyncStorageKeys["ENABLED"] = "ENABLED";
    SyncStorageKeys["PAYMENT"] = "PAYMENT";
    SyncStorageKeys["ONBOARDED"] = "ONBOARDED";
    SyncStorageKeys["GLOBAL_PREFS"] = "PREFS";
})(SyncStorageKeys || (SyncStorageKeys = {}));
function updateGameName(gameName) {
    return chrome.storage.local.set({ [LocalStorageKeys.GAME_NAME]: gameName });
}
exports.updateGameName = updateGameName;
function getLocalGameStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield chrome.storage.local.get(LocalStorageKeys.GAME_NAME);
        return (data && data[LocalStorageKeys.GAME_NAME]) || null;
    });
}
exports.getLocalGameStatus = getLocalGameStatus;
/**
 * Sets "seen onboarding" to true.
 */
function storeSeenOnboarding() {
    return chrome.storage.sync.set({ [SyncStorageKeys.ONBOARDED]: true });
}
exports.storeSeenOnboarding = storeSeenOnboarding;
/**
 * Updates a stored gamepad config by name (does not set it as active)
 */
function storeGamepadConfig(name, gamepadConfig) {
    return chrome.storage.sync.set({ [`${SyncStorageKeys.GAMEPAD_CONFIGS}:${name}`]: gamepadConfig });
}
exports.storeGamepadConfig = storeGamepadConfig;
/**
 * Deletes a stored gamepad config.
 * Be careful not to delete the active config!
 */
function deleteGamepadConfig(name) {
    if (name === gamepadConfig_1.DEFAULT_CONFIG_NAME) {
        throw new Error('Cannot delete default config');
    }
    return chrome.storage.sync.remove(`${SyncStorageKeys.GAMEPAD_CONFIGS}:${name}`);
}
exports.deleteGamepadConfig = deleteGamepadConfig;
/**
 * Sets the extension enabled/disabled.
 */
function storeGamepadConfigEnabled(enabled) {
    return chrome.storage.sync.set({ [SyncStorageKeys.ENABLED]: enabled });
}
exports.storeGamepadConfigEnabled = storeGamepadConfigEnabled;
/**
 * Updates global preferences.
 */
function storeGlobalPrefs(prefs) {
    return chrome.storage.sync.set({ [SyncStorageKeys.GLOBAL_PREFS]: prefs });
}
exports.storeGlobalPrefs = storeGlobalPrefs;
/**
 * Sets a gamepad config as active.
 */
function storeActiveGamepadConfig(name) {
    // TODO validate the name exists before setting it active?
    return chrome.storage.sync.set({
        [SyncStorageKeys.ENABLED]: true,
        [SyncStorageKeys.ACTIVE_GAMEPAD_CONFIG]: name,
    });
}
exports.storeActiveGamepadConfig = storeActiveGamepadConfig;
function normalizeGamepadConfigs(data = {}) {
    const activeConfig = data[SyncStorageKeys.ACTIVE_GAMEPAD_CONFIG] || gamepadConfig_1.DEFAULT_CONFIG_NAME;
    const payment = data[SyncStorageKeys.PAYMENT];
    const prefs = data[SyncStorageKeys.GLOBAL_PREFS] || defaults_1.defaultPrefs;
    const isEnabled = data[SyncStorageKeys.ENABLED] === undefined
        ? !!data[SyncStorageKeys.ACTIVE_GAMEPAD_CONFIG]
        : data[SyncStorageKeys.ENABLED];
    const allKeys = Object.keys(data);
    const configKeys = allKeys.filter((key) => key.startsWith(SyncStorageKeys.GAMEPAD_CONFIGS));
    const seenOnboarding = data[SyncStorageKeys.ONBOARDED] || configKeys.length > 1 || activeConfig !== gamepadConfig_1.DEFAULT_CONFIG_NAME;
    const initialConfigsMap = {
        [gamepadConfig_1.DEFAULT_CONFIG_NAME]: gamepadConfig_1.defaultGamepadConfig,
    };
    return {
        isEnabled,
        activeConfig,
        seenOnboarding,
        payment,
        prefs,
        configs: configKeys.reduce((configs, key) => {
            const name = key.split(':')[1];
            const config = data[key];
            (0, gamepadConfig_1.upgradeOldGamepadConfig)(config);
            configs[name] = config;
            return configs;
        }, initialConfigsMap),
    };
}
function getAllStoredSync() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield chrome.storage.sync.get(null);
        return normalizeGamepadConfigs(data);
    });
}
exports.getAllStoredSync = getAllStoredSync;


/***/ }),

/***/ 37059:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Wrapped to support both manifest v2 and v3
// https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#action-api-unification
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.enableActionButton = exports.disableActionButton = void 0;
function disableActionButton() {
    if (chrome.action !== undefined) {
        return chrome.action.disable();
    }
    else {
        return chrome.browserAction.disable();
    }
}
exports.disableActionButton = disableActionButton;
function enableActionButton(tabId) {
    if (chrome.action !== undefined) {
        return chrome.action.enable(tabId);
    }
    else {
        return chrome.browserAction.enable(tabId);
    }
}
exports.enableActionButton = enableActionButton;


/***/ }),

/***/ 65040:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrayPrevOrNext = void 0;
function arrayPrevOrNext(array, currentIndex, isPrev) {
    const n = array.length;
    if (n === 0) {
        throw new Error('Array must not be empty');
    }
    if (n === 1) {
        return array[currentIndex];
    }
    const i = currentIndex + (isPrev ? -1 : 1);
    return array[((i % n) + n) % n];
}
exports.arrayPrevOrNext = arrayPrevOrNext;


/***/ }),

/***/ 5879:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setActiveConfig = exports.sendMessage = void 0;
const messages_1 = __webpack_require__(28724);
const chromeStoredData_1 = __webpack_require__(8555);
const tabsUtils_1 = __webpack_require__(32550);
function sendMessage(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const tabs = yield (0, tabsUtils_1.getAllTabs)();
        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, msg, () => {
                // Ignore errors here since we blast message to all tabs, some of which may not have listeners
                // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/Y5pYf1iv2k4?pli=1
                // eslint-disable-next-line no-unused-expressions
                chrome.runtime.lastError;
            });
        });
    });
}
exports.sendMessage = sendMessage;
function setActiveConfig(name, gamepadConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sendMessage((0, messages_1.activateGamepadConfigMsg)(name, gamepadConfig));
        yield (0, chromeStoredData_1.storeActiveGamepadConfig)(name);
        return { name, gamepadConfig };
    });
}
exports.setActiveConfig = setActiveConfig;


/***/ }),

/***/ 32550:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAllTabs = exports.getActiveTab = void 0;
function getActiveTab() {
    return __awaiter(this, void 0, void 0, function* () {
        const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0];
    });
}
exports.getActiveTab = getActiveTab;
function getAllTabs() {
    return __awaiter(this, void 0, void 0, function* () {
        const tabs = yield chrome.tabs.query({ status: 'complete' });
        return tabs;
    });
}
exports.getAllTabs = getAllTabs;


/***/ }),

/***/ 53201:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPrefs = void 0;
exports.defaultPrefs = { showControlsOverlay: false };


/***/ }),

/***/ 43842:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.camelToSpace = void 0;
function camelToSpace(str) {
    const cleanedUp = str.replace(/([a-z|0-9])([A-Z])/g, '$1 $2');
    return cleanedUp.charAt(0).toUpperCase() + cleanedUp.slice(1);
}
exports.camelToSpace = camelToSpace;


/***/ }),

/***/ 4053:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.emptyGamepadConfig = exports.defaultGamepadConfig = exports.isGamepadConfigValid = exports.validateMouseConfig = exports.processGamepadConfig = exports.upgradeOldGamepadConfig = exports.isButtonMapping = exports.MAX_BINDINGS_PER_BUTTON = exports.DEFAULT_SENSITIVITY = exports.MAX_NUM_CONFIGS = exports.DEFAULT_CONFIG_NAME = void 0;
const formattingUtils_1 = __webpack_require__(43842);
exports.DEFAULT_CONFIG_NAME = 'default';
exports.MAX_NUM_CONFIGS = 25;
exports.DEFAULT_SENSITIVITY = 10;
exports.MAX_BINDINGS_PER_BUTTON = 2; // TODO do people want/need tripple keybinds?
const buttonToGamepadIndex = {
    a: 0,
    b: 1,
    x: 2,
    y: 3,
    leftShoulder: 4,
    rightShoulder: 5,
    leftTrigger: 6,
    rightTrigger: 7,
    select: 8,
    start: 9,
    leftStickPressed: 10,
    rightStickPressed: 11,
    dpadUp: 12,
    dpadDown: 13,
    dpadLeft: 14,
    dpadRight: 15,
    home: 16,
};
const buttonToAxisIndex = (button) => {
    return button[0] === 'l' ? 0 : 1;
};
const buttonToAxisDirection = (button) => {
    return button.replace(/^(left|right)Stick/, '')[0].toLowerCase();
};
const isButtonMapping = (mapping) => {
    return mapping.gamepadIndex !== undefined;
};
exports.isButtonMapping = isButtonMapping;
// Modifies a gamepad config in-place to convert old schemas
function upgradeOldGamepadConfig(config) {
    const { keyConfig } = config;
    Object.keys(keyConfig).forEach((button) => {
        const keyMap = keyConfig[button];
        if (!keyMap) {
            return;
        }
        const codes = (!Array.isArray(keyMap) ? [keyMap] : keyMap).flatMap((code) => {
            // Expand any special code into a group of codes (e.g. 'Scroll' -> ['ScrollUp', 'ScrollDown'])
            if (code === 'Scroll') {
                return ['ScrollUp', 'ScrollDown'];
            }
            return code;
        });
        keyConfig[button] = codes;
    });
}
exports.upgradeOldGamepadConfig = upgradeOldGamepadConfig;
function processGamepadConfig(config) {
    // Validate a given code has only one button
    // and normalize from code to buttons array
    const codeMapping = {};
    const invalidButtons = {};
    Object.keys(config).forEach((button) => {
        const keyMap = config[button];
        if (!keyMap) {
            return;
        }
        const codes = !Array.isArray(keyMap) ? [keyMap] : keyMap;
        // Technically we allow importing configs with more than MAX_BINDINGS_PER_BUTTON, but it is not possible
        // in the UI. We could validate it here if we want to be more strict.
        // if (codes.length > MAX_BINDINGS_PER_BUTTON) {
        //   invalidButtons[button] = `Only ${MAX_BINDINGS_PER_BUTTON} bindings per button is allowed`;
        //   return;
        // }
        for (const code of codes) {
            if (code === 'Escape') {
                invalidButtons[button] = 'Binding Escape key is not allowed';
                continue;
            }
            if (codeMapping[code]) {
                invalidButtons[button] = `'${code}' is already bound to button '${(0, formattingUtils_1.camelToSpace)(codeMapping[code].button)}'`;
                continue;
            }
            const gamepadIndex = buttonToGamepadIndex[button];
            if (gamepadIndex !== undefined) {
                codeMapping[code] = { button, gamepadIndex };
            }
            else {
                const axisIndex = buttonToAxisIndex(button);
                const axisDirection = buttonToAxisDirection(button);
                codeMapping[code] = { button, axisIndex, axisDirection };
            }
        }
    });
    return { codeMapping, invalidButtons, hasErrors: Object.keys(invalidButtons).length > 0 };
}
exports.processGamepadConfig = processGamepadConfig;
function validateMouseConfig(mouseConfig) {
    const { sensitivity, mouseControls } = mouseConfig;
    const errors = {};
    if (mouseControls !== undefined && mouseControls !== 0 && mouseControls !== 1) {
        errors.mouseControls = 'Invalid stick number';
    }
    if (sensitivity < 1 || sensitivity > 1000) {
        errors.mouseControls = 'Invalid sensitivity value. Must be between 1 and 1000.';
    }
    return { errors, hasErrors: Object.keys(errors).length > 0 };
}
exports.validateMouseConfig = validateMouseConfig;
function isGamepadConfigValid(gamepadConfig) {
    try {
        const { hasErrors: mouseErrors } = validateMouseConfig(gamepadConfig.mouseConfig);
        if (mouseErrors) {
            return false;
        }
        const { hasErrors: buttonErrors } = processGamepadConfig(gamepadConfig.keyConfig);
        return !buttonErrors;
    }
    catch (e) {
        return false;
    }
}
exports.isGamepadConfigValid = isGamepadConfigValid;
exports.defaultGamepadConfig = {
    mouseConfig: {
        mouseControls: 1,
        sensitivity: exports.DEFAULT_SENSITIVITY,
    },
    // Find "event.code" from https://keycode.info/
    keyConfig: {
        a: 'Space',
        b: ['ControlLeft', 'Backspace'],
        x: 'KeyR',
        y: ['ScrollUp', 'ScrollDown'],
        leftShoulder: ['KeyC', 'KeyG'],
        leftTrigger: 'RightClick',
        rightShoulder: 'KeyQ',
        rightTrigger: 'Click',
        start: 'Enter',
        select: 'Tab',
        home: undefined,
        dpadUp: ['ArrowUp', 'KeyX'],
        dpadLeft: ['ArrowLeft', 'KeyN'],
        dpadDown: ['ArrowDown', 'KeyZ'],
        dpadRight: 'ArrowRight',
        leftStickUp: 'KeyW',
        leftStickLeft: 'KeyA',
        leftStickDown: 'KeyS',
        leftStickRight: 'KeyD',
        rightStickUp: 'KeyO',
        rightStickLeft: 'KeyK',
        rightStickDown: 'KeyL',
        rightStickRight: 'Semicolon',
        leftStickPressed: 'ShiftLeft',
        rightStickPressed: 'KeyF',
    },
};
exports.emptyGamepadConfig = {
    mouseConfig: {
        mouseControls: undefined,
        sensitivity: exports.DEFAULT_SENSITIVITY,
    },
    keyConfig: Object.keys(exports.defaultGamepadConfig.keyConfig).reduce((keyConfig, key) => {
        keyConfig[key] = undefined;
        return keyConfig;
    }, {}),
};


/***/ }),

/***/ 28724:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.closeWindowMsg = exports.updatePrefsMsg = exports.disableGamepadMsg = exports.activateGamepadConfigMsg = exports.initializeResponseMsg = exports.seenOnboardingMsg = exports.gameChangedMsg = exports.intializedMsg = exports.injectedMsg = exports.MessageTypes = void 0;
var MessageTypes;
(function (MessageTypes) {
    MessageTypes["INJECTED"] = "INJECTED";
    MessageTypes["INITIALIZED"] = "INITIALIZED";
    MessageTypes["GAME_CHANGED"] = "GAME_CHANGED";
    MessageTypes["ACTIVATE_GAMEPAD_CONFIG"] = "ACTIVATE_GAMEPAD_CONFIG";
    MessageTypes["INITIALIZE_RESPONSE"] = "INITIALIZE_RESPONSE";
    MessageTypes["SEEN_ONBOARDING"] = "SEEN_ONBOARDING";
    MessageTypes["UPDATE_PREFS"] = "UPDATE_PREFS";
    MessageTypes["CLOSE_WINDOW"] = "CLOSE_WINDOW";
})(MessageTypes = exports.MessageTypes || (exports.MessageTypes = {}));
// Sent from page to background to enable the context button in the toolbar
function injectedMsg() {
    return { type: MessageTypes.INJECTED };
}
exports.injectedMsg = injectedMsg;
// Sent from page to background to load all settings
function intializedMsg(gameName) {
    return { type: MessageTypes.INITIALIZED, gameName };
}
exports.intializedMsg = intializedMsg;
// Sent from page to background to set game name manually
function gameChangedMsg(gameName) {
    return { type: MessageTypes.GAME_CHANGED, gameName };
}
exports.gameChangedMsg = gameChangedMsg;
// Sent from the page to background to note the user has seen the onboarding
function seenOnboardingMsg(seen = true) {
    return { type: MessageTypes.SEEN_ONBOARDING, seen };
}
exports.seenOnboardingMsg = seenOnboardingMsg;
// Sent from background to page for user's first time using the extension
function initializeResponseMsg(name, gamepadConfig, seenOnboarding, prefs) {
    return { type: MessageTypes.INITIALIZE_RESPONSE, name, gamepadConfig, seenOnboarding, prefs };
}
exports.initializeResponseMsg = initializeResponseMsg;
// Sent from background to page to set active mouse+keyboard config (null for disabled)
function activateGamepadConfigMsg(name, gamepadConfig) {
    return { type: MessageTypes.ACTIVATE_GAMEPAD_CONFIG, name, gamepadConfig };
}
exports.activateGamepadConfigMsg = activateGamepadConfigMsg;
function disableGamepadMsg() {
    return activateGamepadConfigMsg(null, null);
}
exports.disableGamepadMsg = disableGamepadMsg;
// Sent from the background to page when preferences are updated that would impact it
function updatePrefsMsg(prefs) {
    return { type: MessageTypes.UPDATE_PREFS, prefs };
}
exports.updatePrefsMsg = updatePrefsMsg;
// Sent from the background to popup to close
function closeWindowMsg() {
    return { type: MessageTypes.CLOSE_WINDOW };
}
exports.closeWindowMsg = closeWindowMsg;


/***/ }),

/***/ 72133:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.notPaidPayment = exports.getExtPay = void 0;
const extpay_1 = __importDefault(__webpack_require__(47525));
function getExtPay() {
    return (0, extpay_1.default)('keyboard-and-mouse-for-xbox-xcloud');
}
exports.getExtPay = getExtPay;
exports.notPaidPayment = {
    paid: false,
    paidAt: null,
    installedAt: new Date().getTime(),
};


/***/ }),

/***/ 93150:
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.7.0 - Tue Nov 10 2020 20:24:04 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.rejection
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(extensionAPIs.runtime.lastError);
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      }); // Keep track if the deprecation warning has been logged at least once.


      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(extensionAPIs.runtime.lastError);
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});
//# sourceMappingURL=browser-polyfill.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const chromeStoredData_1 = __webpack_require__(8555);
const actionButtonUtils_1 = __webpack_require__(37059);
const generalUtils_1 = __webpack_require__(65040);
const messageUtils_1 = __webpack_require__(5879);
const gamepadConfig_1 = __webpack_require__(4053);
const messages_1 = __webpack_require__(28724);
const payments_1 = __webpack_require__(72133);
(0, payments_1.getExtPay)().startBackground();
/*
 * This script is run as a service worker and may be killed or restarted at any time.
 * Make sure to read the following for more information:
 * https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/
 */
chrome.runtime.onInstalled.addListener(({ reason }) => {
    // Page actions are disabled by default and enabled on select tabs
    if (reason === 'install') {
        // First time install - enable the default gamepad config
        (0, chromeStoredData_1.storeActiveGamepadConfig)(gamepadConfig_1.DEFAULT_CONFIG_NAME);
    }
    if (typeof chrome.runtime.setUninstallURL === 'function') {
        chrome.runtime.setUninstallURL('https://forms.gle/nzToDcw1mmssMBLx6');
    }
});
// https://developer.chrome.com/docs/extensions/reference/commands/#handling-command-events
chrome.commands.onCommand.addListener((command) => {
    console.log('Keyboard command:', command);
    const commandToProfileOrder = {
        'profile-prev': true,
        'profile-next': false,
    };
    (0, chromeStoredData_1.getAllStoredSync)().then(({ activeConfig, configs, prefs }) => {
        const isPrev = commandToProfileOrder[command];
        if (command === 'show-hide-cheatsheet') {
            const newPrefs = Object.assign(Object.assign({}, prefs), { showControlsOverlay: !prefs.showControlsOverlay });
            (0, messageUtils_1.sendMessage)((0, messages_1.updatePrefsMsg)(newPrefs));
            (0, chromeStoredData_1.storeGlobalPrefs)(newPrefs);
        }
        else if (isPrev !== undefined) {
            const configsArray = Object.keys(configs);
            const currentConfigIndex = configsArray.indexOf(activeConfig);
            const nextConfigName = currentConfigIndex === -1 ? gamepadConfig_1.DEFAULT_CONFIG_NAME : (0, generalUtils_1.arrayPrevOrNext)(configsArray, currentConfigIndex, isPrev);
            const nextConfig = configs[nextConfigName];
            (0, messageUtils_1.setActiveConfig)(nextConfigName, nextConfig);
        }
        // Close the popup if it is open to avoid it showing stale data
        chrome.runtime.sendMessage((0, messages_1.closeWindowMsg)());
    });
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Receives messages from the content_script
    if (!sender.tab)
        return false;
    if (msg.type === messages_1.MessageTypes.INJECTED) {
        console.log('Injected');
        (0, chromeStoredData_1.getAllStoredSync)().then(({ seenOnboarding }) => {
            sendResponse((0, messages_1.seenOnboardingMsg)(seenOnboarding));
        });
        // Note this is probably not needed anymore, since action button should always be enabled now
        (0, actionButtonUtils_1.enableActionButton)(sender.tab.id);
        return true;
    }
    if (msg.type === messages_1.MessageTypes.INITIALIZED) {
        console.log('Initialized', msg.gameName);
        (0, chromeStoredData_1.updateGameName)(msg.gameName);
        // Send any currently-active config
        (0, chromeStoredData_1.getAllStoredSync)().then(({ isEnabled, activeConfig, configs, seenOnboarding, prefs }) => {
            const config = !isEnabled ? null : configs[activeConfig];
            sendResponse((0, messages_1.initializeResponseMsg)(activeConfig, config, seenOnboarding, prefs));
        });
        // https://stackoverflow.com/a/56483156
        return true;
    }
    if (msg.type === messages_1.MessageTypes.GAME_CHANGED) {
        console.log('Game changed to', msg.gameName);
        (0, chromeStoredData_1.updateGameName)(msg.gameName);
        return false;
    }
    if (msg.type === messages_1.MessageTypes.SEEN_ONBOARDING) {
        console.log('User dismissed onboarding');
        (0, chromeStoredData_1.storeSeenOnboarding)();
        return false;
    }
    return false;
});

})();

/******/ })()
;