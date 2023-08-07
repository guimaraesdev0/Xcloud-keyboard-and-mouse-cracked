/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 81018:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(67294));
const Header_1 = __importDefault(__webpack_require__(62819));
const MainConfigEditor_1 = __importDefault(__webpack_require__(78966));
const useGameStatus_1 = __importDefault(__webpack_require__(78720));
const useGamepadConfigs_1 = __importDefault(__webpack_require__(42411));
const UpsellModal_1 = __importDefault(__webpack_require__(77516));
function Popup() {
    const { activeConfig, status, isEnabled, configs, error } = (0, useGamepadConfigs_1.default)();
    const { gameName } = (0, useGameStatus_1.default)();
    return (react_1.default.createElement("div", { className: "popup vertical" },
        react_1.default.createElement(Header_1.default, { activeConfig: activeConfig, isEnabled: isEnabled, gameName: gameName }),
        react_1.default.createElement(MainConfigEditor_1.default, { activeConfig: activeConfig, isEnabled: isEnabled, status: status, configs: configs, error: error }),
        react_1.default.createElement(UpsellModal_1.default, null)));
}
exports["default"] = Popup;


/***/ }),

/***/ 18019:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(67294));
function ErrorDetails({ error }) {
    return (react_1.default.createElement("div", { className: "error" },
        react_1.default.createElement("p", null, "Unable to access settings from storage"),
        error ? react_1.default.createElement("p", null,
            "Error: \"",
            error.message,
            "\"") : null,
        react_1.default.createElement("p", null,
            "Please post this",
            ' ',
            react_1.default.createElement("a", { href: "https://github.com/idolize/xcloud-keyboard-mouse/issues/", target: "_blank", rel: "noreferrer" }, "issue to GitHub"))));
}
exports["default"] = ErrorDetails;


/***/ }),

/***/ 97625:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(85411);
const react_2 = __importStar(__webpack_require__(67294));
const gamepadConfig_1 = __webpack_require__(4053);
const selectors_1 = __webpack_require__(83522);
const confirmUtil_1 = __webpack_require__(99893);
const reduxHooks_1 = __webpack_require__(97121);
const SensitivitySelector_1 = __importDefault(__webpack_require__(4630));
const StickSelector_1 = __importDefault(__webpack_require__(13869));
const useKeyConfigEditorState_1 = __importDefault(__webpack_require__(67383));
const importExport_1 = __webpack_require__(85750);
const KeybindingsTable_1 = __importDefault(__webpack_require__(72208));
const saveIcon = { iconName: 'Save' };
const useIcon = { iconName: 'SkypeCheck' };
function GamepadConfigEditor({ name, onSubmitChanges, onCancelCreate, onActivate, onDelete }) {
    const { status, config: storedGamepadConfig } = (0, reduxHooks_1.useAppSelector)((state) => (0, selectors_1.getGamepadConfig)(state, name));
    const isActive = (0, reduxHooks_1.useAppSelector)((state) => (0, selectors_1.isConfigActive)(state, name));
    const isSubmitting = status === 'writing';
    const isNewDraft = !storedGamepadConfig;
    const isDefaultConfig = name === gamepadConfig_1.DEFAULT_CONFIG_NAME;
    // assume any "missing" config name is a new gamepad config, since it isn't saved yet
    // and default the draft to the "defaultGamepadConfig"
    const initialGamepadConfig = storedGamepadConfig || gamepadConfig_1.defaultGamepadConfig;
    const [state, dispatchState] = (0, useKeyConfigEditorState_1.default)(initialGamepadConfig);
    const noMouse = state.config.mouseConfig.mouseControls === undefined;
    const hasChanges = isNewDraft || state.changes.keyConfig || state.changes.mouseConfig;
    // Starts in read-only state, but have button to enable editing/save changes?
    const [isEditing, setIsEditing] = (0, react_2.useState)(isNewDraft);
    (0, react_2.useEffect)(() => {
        if (isNewDraft) {
            setIsEditing(true);
        }
        else {
            setIsEditing(false);
        }
        dispatchState({ type: 'reset', config: initialGamepadConfig });
    }, [dispatchState, name, isNewDraft, initialGamepadConfig]);
    const handleKeybindChange = (0, react_2.useCallback)((button, updated) => {
        dispatchState({
            type: 'updateKeyConfig',
            button,
            keyMap: updated,
        });
    }, [dispatchState]);
    const handleMouseControlsChange = (0, react_2.useCallback)((mouseControls) => {
        dispatchState({
            type: 'updateMouseControls',
            mouseControls,
        });
    }, [dispatchState]);
    const handleActivate = (0, react_2.useCallback)(() => {
        onActivate(name);
    }, [name, onActivate]);
    const handleToggleEditing = (0, react_2.useCallback)(() => {
        if (isNewDraft && isEditing) {
            if ((0, confirmUtil_1.confirm)('Are you sure you want to cancel creating a new preset?')) {
                onCancelCreate();
            }
            return;
        }
        if (isEditing && (!hasChanges || (0, confirmUtil_1.confirm)('Are you sure you want to cancel? You will lose any changes.'))) {
            // Reset
            dispatchState({ type: 'reset', config: storedGamepadConfig });
            setIsEditing(!isEditing);
        }
        else if (!isEditing) {
            setIsEditing(!isEditing);
        }
    }, [dispatchState, hasChanges, isEditing, isNewDraft, onCancelCreate, storedGamepadConfig]);
    const handleDelete = (0, react_2.useCallback)(() => {
        if ((0, confirmUtil_1.confirm)('Are you sure you want to delete this preset?')) {
            onDelete(name);
        }
    }, [name, onDelete]);
    const handleExport = (0, react_2.useCallback)(() => {
        (0, importExport_1.exportConfig)(state.config, name);
    }, [state.config, name]);
    const handleSubmit = (0, react_2.useCallback)((e) => {
        e.preventDefault();
        if (!state.errors.hasErrors) {
            onSubmitChanges(name, state.config);
        }
        else {
            console.error('Cannot submit', state.errors);
        }
    }, [name, onSubmitChanges, state.config, state.errors]);
    return (react_2.default.createElement("form", { className: "vertical full-height", onSubmit: handleSubmit },
        react_2.default.createElement("section", { className: "config-editor vertical" },
            react_2.default.createElement(KeybindingsTable_1.default, { className: "margin-vertical", gamepadConfig: state.config, errors: state.errors, isEditing: isEditing, onKeybindChange: handleKeybindChange }),
            react_2.default.createElement("div", { className: "margin-bottom" },
                react_2.default.createElement("div", { className: "horizontal" },
                    react_2.default.createElement(StickSelector_1.default, { readOnly: !isEditing, onChange: handleMouseControlsChange, stick: state.config.mouseConfig.mouseControls })),
                react_2.default.createElement(SensitivitySelector_1.default, { dispatch: dispatchState, disabled: noMouse, readOnly: !isEditing, sensitivity: state.config.mouseConfig.sensitivity }))),
        react_2.default.createElement("section", { className: "horizontal space-between padding-top-s" },
            react_2.default.createElement("div", { className: "margin-right-s" },
                react_2.default.createElement(react_1.DefaultButton, { onClick: handleToggleEditing }, isEditing ? 'Cancel' : 'Edit'),
                !isEditing ? (react_2.default.createElement(react_1.DefaultButton, { className: "margin-left-s", disabled: isDefaultConfig, onClick: handleDelete, title: isDefaultConfig ? 'Default preset cannot be deleted' : undefined }, "Delete")) : null,
                !isEditing ? (react_2.default.createElement(react_1.DefaultButton, { className: "margin-left-s", onClick: handleExport }, "Export")) : null),
            isEditing ? (react_2.default.createElement(react_1.PrimaryButton, { type: "submit", disabled: state.errors.hasErrors || !hasChanges || isSubmitting, iconProps: saveIcon }, isNewDraft ? 'Create' : 'Save')) : (react_2.default.createElement(react_1.PrimaryButton, { onClick: handleActivate, disabled: state.errors.hasErrors || isActive || isSubmitting, iconProps: useIcon }, "Use")))));
}
exports["default"] = (0, react_2.memo)(GamepadConfigEditor);


/***/ }),

/***/ 39614:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const classnames_1 = __importDefault(__webpack_require__(94184));
const react_2 = __webpack_require__(85411);
const gamepadConfig_1 = __webpack_require__(4053);
const NewConfigButton_1 = __importDefault(__webpack_require__(29189));
const icons_1 = __webpack_require__(86968);
const generalUtils_1 = __webpack_require__(65040);
const dropdownStyles = {
    root: { width: '100%' },
    title: { border: 'none', background: 'transparent' },
};
function ConfigTitle({ name, status }) {
    return (react_1.default.createElement("div", { className: "horizontal centered" },
        react_1.default.createElement("span", { className: (0, classnames_1.default)('overflow-ellipsis margin-right-s', status && 'selector-active') }, name),
        status ? react_1.default.createElement("small", null,
            "(",
            status,
            ")") : null));
}
function renderOption(option) {
    var _a;
    return option ? react_1.default.createElement(ConfigTitle, { name: option.text, status: ((_a = option.data) === null || _a === void 0 ? void 0 : _a.active) && 'Active' }) : null;
}
function renderTitle(options) {
    const option = options && options[0];
    return renderOption(option);
}
function GamepadConfigSelector({ className, currentConfig, activeConfig, isEnabled, isPaid, allConfigs, setCurrentConfig, addNewConfig, importConfig, openPaymentPage, toggleShowSettings, }) {
    const configsArray = (0, react_1.useMemo)(() => Object.keys(allConfigs), [allConfigs]);
    const currentConfigIndex = (0, react_1.useMemo)(() => configsArray.indexOf(currentConfig), [configsArray, currentConfig]);
    const isNew = !allConfigs[currentConfig];
    const onlyOneConfig = configsArray.length < 2;
    const handleMove = (isBack) => {
        const nextConfigName = (0, generalUtils_1.arrayPrevOrNext)(configsArray, currentConfigIndex, isBack);
        setCurrentConfig(nextConfigName);
    };
    const handleSelectConfig = (0, react_1.useCallback)((_event, item) => {
        if (item) {
            setCurrentConfig(item.key);
        }
    }, [setCurrentConfig]);
    const arrowCssClasses = (0, classnames_1.default)(onlyOneConfig && 'not-allowed-cursor');
    const rootCssClasses = (0, classnames_1.default)('config-selector horizontal centered', !isNew && 'space-between', className);
    const dropdownOptions = (0, react_1.useMemo)(() => configsArray.map((configName) => ({
        key: configName,
        text: configName,
        data: isEnabled && configName === activeConfig ? { active: true } : undefined,
    })), [configsArray, isEnabled, activeConfig]);
    return isNew ? (react_1.default.createElement("div", { className: rootCssClasses },
        react_1.default.createElement(ConfigTitle, { name: currentConfig, status: "New" }))) : (react_1.default.createElement("div", { className: rootCssClasses },
        react_1.default.createElement(react_2.DefaultButton, { className: arrowCssClasses, disabled: onlyOneConfig, onClick: () => handleMove(true), title: "Previous preset" },
            react_1.default.createElement(icons_1.ChevronLeftIcon, null)),
        react_1.default.createElement(react_2.Dropdown, { ariaLabel: "Select preset", calloutProps: { doNotLayer: true }, selectedKey: currentConfig, onChange: handleSelectConfig, styles: dropdownStyles, options: dropdownOptions, onRenderTitle: renderTitle, onRenderOption: renderOption, responsiveMode: react_2.ResponsiveMode.large }),
        react_1.default.createElement("div", { className: "horizontal" },
            react_1.default.createElement(react_2.DefaultButton, { className: arrowCssClasses, disabled: configsArray.length < 2, onClick: () => handleMove(false), title: "Next preset" },
                react_1.default.createElement(icons_1.ChevronRightIcon, null)),
            react_1.default.createElement(NewConfigButton_1.default, { isPaid: isPaid, disabled: configsArray.length >= gamepadConfig_1.MAX_NUM_CONFIGS - 1, allConfigs: allConfigs, onCreate: addNewConfig, onImport: importConfig, onOpenPaymentPage: openPaymentPage }),
            react_1.default.createElement(react_2.IconButton, { onClick: toggleShowSettings, title: "Settings", ariaLabel: "Settings" },
                react_1.default.createElement(icons_1.Wrench, null)))));
}
exports["default"] = (0, react_1.memo)(GamepadConfigSelector);


/***/ }),

/***/ 58287:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(85411);
const react_2 = __importStar(__webpack_require__(67294));
const react_redux_1 = __webpack_require__(85656);
const actions_1 = __webpack_require__(48911);
const selectors_1 = __webpack_require__(83522);
const reduxHooks_1 = __webpack_require__(97121);
const ShortcutCommandsList_1 = __importDefault(__webpack_require__(70429));
const backIcon = { iconName: 'SkypeArrow' };
function GlobalPrefsEditor({ goBack }) {
    const dispatch = (0, react_redux_1.useDispatch)();
    const prefs = (0, reduxHooks_1.useAppSelector)(selectors_1.getGlobalPrefs);
    const handleChange = (0, react_2.useCallback)((e, checked) => {
        dispatch((0, actions_1.updatePrefsAction)(Object.assign(Object.assign({}, prefs), { showControlsOverlay: !!checked })));
    }, [dispatch, prefs]);
    return (react_2.default.createElement("div", null,
        react_2.default.createElement("div", { className: "global-prefs-body" },
            react_2.default.createElement("section", null,
                react_2.default.createElement("h3", null, "Preferences"),
                react_2.default.createElement(react_1.Checkbox, { label: "Show controls cheatsheet overlay", checked: prefs.showControlsOverlay, onChange: handleChange, title: "Show an overlay with all button bindings visible during play" })),
            react_2.default.createElement(react_1.Separator, null),
            react_2.default.createElement(ShortcutCommandsList_1.default, null)),
        react_2.default.createElement(react_1.PrimaryButton, { iconProps: backIcon, onClick: goBack, style: { position: 'absolute', bottom: 0 } }, "Back")));
}
exports["default"] = GlobalPrefsEditor;


/***/ }),

/***/ 62819:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const react_2 = __webpack_require__(85411);
const reduxHooks_1 = __webpack_require__(97121);
const actions_1 = __webpack_require__(48911);
const theme_1 = __webpack_require__(44140);
const Logo_1 = __importDefault(__webpack_require__(95514));
const HeaderMoreOptions_1 = __importDefault(__webpack_require__(5905));
function Header({ gameName, activeConfig, isEnabled }) {
    const dispatch = (0, reduxHooks_1.useAppDispatch)();
    const handleToggle = (0, react_1.useCallback)((event, checked) => {
        if (!checked) {
            dispatch((0, actions_1.disableGamepadConfigAction)());
        }
        else {
            dispatch((0, actions_1.activateGamepadConfigAction)({ name: activeConfig }));
        }
    }, [dispatch, activeConfig]);
    return (react_1.default.createElement(react_2.ThemeProvider, { theme: theme_1.fluentXboxHeaderTheme },
        react_1.default.createElement("header", { className: "box horizontal cracked-bg space-between setup-details" },
            react_1.default.createElement("div", { className: "logo unselectable horizontal centered-v" },
                react_1.default.createElement(Logo_1.default, { isEnabled: isEnabled }),
                react_1.default.createElement(react_2.Toggle, { title: `${isEnabled ? 'Disable' : 'Enable'} mouse and keyboard`, checked: isEnabled, onChange: handleToggle, className: "no-margin margin-left" })),
            react_1.default.createElement("div", { className: "horizontal centered" },
                react_1.default.createElement("div", { className: "vertical centered-v left-aligned margin-right" },
                    react_1.default.createElement("div", { className: "overflow-ellipsis" },
                        react_1.default.createElement("small", null, "Playing:"),
                        " ",
                        react_1.default.createElement("span", null, gameName || 'None')),
                    react_1.default.createElement("div", { className: "overflow-ellipsis" },
                        react_1.default.createElement("small", null, "Preset:"),
                        " ",
                        react_1.default.createElement("span", null, activeConfig || 'None'))),
                react_1.default.createElement(HeaderMoreOptions_1.default, null)))));
}
exports["default"] = Header;


/***/ }),

/***/ 5905:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(85411);
const react_2 = __importStar(__webpack_require__(67294));
const react_redux_1 = __webpack_require__(85656);
const theme_1 = __webpack_require__(44140);
const selectors_1 = __webpack_require__(83522);
const actions_1 = __webpack_require__(48911);
const reduxHooks_1 = __webpack_require__(97121);
const specialColor = { color: '#D2042D' };
const getMenuItems = (isPaid, onPay) => [
    {
        key: 'version',
        text: `Version ${chrome.runtime.getManifest().version}`,
        disabled: true,
    },
    {
        key: 'CheckUpdate',
        text: '🔁',
        href: 'https://github.com/guimaraesdev0/Xcloud-keyboard-and-mouse-cracked',
        target: '_blank',
        iconProps: { iconName: 'InfoSolid' },
    },
    {
        key: 'guimaraes',
        text: '💜 Creator Channel',
        href: 'https://www.youtube.com/channel/UC1MWeOnapoUpalg9iMdJ0BQ',
        target: '_blank',
        iconProps: { iconName: 'Diamond' },
    },
    {
        key: 'upgrade',
        text: 'You have premium',
        iconProps: { iconName: 'Diamond' },
    },
    {
        key: 'about',
        text: 'About',
        href: chrome.runtime.getURL('/about.html'),
        target: '_blank',
        iconProps: { iconName: 'InfoSolid' },
    },
    {
        key: 'issues',
        text: 'File an issue',
        href: 'https://github.com/idolize/xcloud-keyboard-mouse/issues',
        target: '_blank',
        iconProps: { iconName: 'IssueTracking' },
    },
    {
        key: 'testGamepad',
        text: 'Test your preset',
        href: 'https://gamepad-tester.com',
        target: '_blank',
        iconProps: { iconName: 'TestBeakerSolid' },
    },
    {
        key: 'xcloud',
        text: 'Go to xCloud',
        href: 'https://xbox.com/play',
        target: '_blank',
        iconProps: { iconName: 'Cloud' },
    },
];
function HeaderMoreOptions() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const payment = (0, reduxHooks_1.useAppSelector)(selectors_1.getPayment);
    const handlePayClick = (0, react_2.useCallback)(() => {
        dispatch((0, actions_1.showUpsellModalAction)(true));
    }, [dispatch]);
    const menuItems = (0, react_2.useMemo)(() => {
        return getMenuItems(payment.paid, handlePayClick);
    }, [payment.paid, handlePayClick]);
    return (react_2.default.createElement(react_1.IconButton, { menuProps: {
            items: menuItems,
            theme: theme_1.fluentXboxTheme,
            calloutProps: {
                // Needed to fix issue in Safari
                preventDismissOnEvent: (e) => e.type === 'resize',
            },
        }, role: "menuitem", title: "More info" }));
}
exports["default"] = HeaderMoreOptions;


/***/ }),

/***/ 95514:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(67294));
function Logo({ isEnabled }) {
    const opacity = { opacity: isEnabled ? 1 : 0.5 };
    const imgStyle = {
        width: 20,
        height: 20,
    };
    // removed xbox logo for now
    // const plus = <span style={{ padding: '0 5px', paddingBottom: 4, fontWeight: 'bold', ...opacity }}>+</span>;
    return (react_1.default.createElement("div", { className: "logo unselectable horizontal centered-v" },
        react_1.default.createElement("img", { src: "/images/keyboard.svg", style: Object.assign(Object.assign({}, imgStyle), opacity), className: "margin-right-s" }),
        react_1.default.createElement("img", { src: "/images/mouse.svg", style: Object.assign(Object.assign({}, imgStyle), opacity) })));
}
exports["default"] = Logo;


/***/ }),

/***/ 78966:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const react_2 = __webpack_require__(85411);
const gamepadConfig_1 = __webpack_require__(4053);
const GamepadConfigEditor_1 = __importDefault(__webpack_require__(97625));
const GamepadConfigSelector_1 = __importDefault(__webpack_require__(39614));
const reduxHooks_1 = __webpack_require__(97121);
const actions_1 = __webpack_require__(48911);
const ErrorDetails_1 = __importDefault(__webpack_require__(18019));
const selectors_1 = __webpack_require__(83522);
const GlobalPrefsEditor_1 = __importDefault(__webpack_require__(58287));
function MainConfigEditor({ activeConfig, isEnabled, configs, status, error }) {
    const dispatch = (0, reduxHooks_1.useAppDispatch)();
    const [currentConfig, setCurrentConfig] = (0, react_1.useState)(activeConfig);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const { paid } = (0, reduxHooks_1.useAppSelector)(selectors_1.getPayment);
    (0, react_1.useEffect)(() => {
        setCurrentConfig(activeConfig);
    }, [activeConfig]);
    const openPaymentPage = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        dispatch((0, actions_1.showUpsellModalAction)(true));
    }), [dispatch]);
    const handleActivateGamepadConfig = (0, react_1.useCallback)((name) => {
        dispatch((0, actions_1.activateGamepadConfigAction)({ name }));
    }, [dispatch]);
    const handleSubmitGamepadConfig = (0, react_1.useCallback)((name, gamepadConfig) => {
        dispatch((0, actions_1.modifyGamepadConfigAction)({ name, gamepadConfig }));
        setCurrentConfig(name);
    }, [dispatch]);
    const handleDeleteGamepadConfig = (0, react_1.useCallback)((name) => {
        dispatch((0, actions_1.deleteGamepadConfigAction)({ name }));
        if (name === currentConfig) {
            setCurrentConfig(gamepadConfig_1.DEFAULT_CONFIG_NAME);
        }
    }, [dispatch, currentConfig, setCurrentConfig]);
    const handleCancelCreate = (0, react_1.useCallback)(() => {
        setCurrentConfig(activeConfig);
    }, [activeConfig, setCurrentConfig]);
    const handleAddNewConfig = (0, react_1.useCallback)((name) => {
        // Should this "draft" name be stored in a different state to be safe?
        setCurrentConfig(name);
    }, [setCurrentConfig]);
    const toggleShowSettings = (0, react_1.useCallback)(() => {
        setShowSettings((old) => !old);
    }, []);
    return (react_1.default.createElement("div", { className: "box margin-full vertical full-height" }, status === 'failure' ? (react_1.default.createElement(ErrorDetails_1.default, { error: error })) : status !== 'success' ? (react_1.default.createElement(react_2.Spinner, { size: react_2.SpinnerSize.large })) : (react_1.default.createElement("div", { className: "vertical full-height", style: { position: 'relative' } }, showSettings ? (react_1.default.createElement(GlobalPrefsEditor_1.default, { goBack: toggleShowSettings })) : (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(GamepadConfigSelector_1.default, { className: "padding-bottom-s", isEnabled: isEnabled, isPaid: paid, activeConfig: activeConfig, currentConfig: currentConfig, allConfigs: configs, setCurrentConfig: setCurrentConfig, addNewConfig: handleAddNewConfig, importConfig: handleSubmitGamepadConfig, openPaymentPage: openPaymentPage, toggleShowSettings: toggleShowSettings }),
        react_1.default.createElement(GamepadConfigEditor_1.default, { name: currentConfig, onActivate: handleActivateGamepadConfig, onDelete: handleDeleteGamepadConfig, onSubmitChanges: handleSubmitGamepadConfig, onCancelCreate: handleCancelCreate })))))));
}
exports["default"] = MainConfigEditor;


/***/ }),

/***/ 29189:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const react_2 = __webpack_require__(85411);
const icons_1 = __webpack_require__(86968);
const importExport_1 = __webpack_require__(85750);
const useIsMounted_1 = __importDefault(__webpack_require__(58750));
function NewConfigButton({ disabled, isPaid, allConfigs, onCreate, onImport, onOpenPaymentPage, }) {
    const buttonId = 'new-config-btn';
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [name, setName] = (0, react_1.useState)('');
    const isMounted = (0, useIsMounted_1.default)();
    const isTaken = (0, react_1.useMemo)(() => {
        return (Object.keys(allConfigs)
            .map((existing) => existing.toLowerCase())
            .indexOf(name.toLowerCase()) !== -1);
    }, [name, allConfigs]);
    const triggerRef = (0, react_1.useRef)(null);
    const handleNewBtnClick = (0, react_1.useCallback)(() => {
        if (isPaid) {
            setIsOpen(!isOpen);
        }
        else {
            setIsOpen(!isOpen);
        }
    }, [isOpen, isPaid, onOpenPaymentPage]);
    const handleClose = (0, react_1.useCallback)(() => {
        setIsOpen(false);
    }, []);
    const handleImport = (0, react_1.useCallback)(() => {
        (0, importExport_1.importConfig)()
            .then((config) => {
            onImport(name, config);
            if (isMounted())
                setName('');
            alert('Preset file imported successfully');
        })
            .catch((errorMsg) => {
            console.error('Import failed', errorMsg);
            alert(errorMsg);
        });
    }, [isMounted, name, onImport]);
    const handleSubmit = (0, react_1.useCallback)(() => {
        onCreate(name);
    }, [onCreate, name]);
    const handleKeyPress = (0, react_1.useCallback)((e) => {
        if (e.code === 'Enter') {
            handleSubmit();
        }
    }, [handleSubmit]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_2.IconButton, { id: buttonId, className: "new-preset-btn", elementRef: triggerRef, onClick: handleNewBtnClick, title: "Add new preset", ariaLabel: "Add new preset", disabled: disabled },
            react_1.default.createElement(icons_1.PlusCircleIcon, null)),
        isOpen ? (react_1.default.createElement(react_2.Callout, { setInitialFocus: true, gapSpace: 0, directionalHint: react_2.DirectionalHint.bottomRightEdge, target: `#${buttonId}`, onDismiss: handleClose, 
            // Needed to fix issue in Safari
            preventDismissOnEvent: (e) => e.type === 'resize' },
            react_1.default.createElement("div", { style: { width: 250 }, className: "padding-full" },
                react_1.default.createElement(react_2.TextField, { placeholder: "New preset name", autoFocus: isOpen, value: name, maxLength: 18, onKeyPress: handleKeyPress, onChange: (e) => setName(e.currentTarget.value) }),
                isTaken ? react_1.default.createElement("div", { className: "error margin-top-s" }, "Config with that name already exists!") : null,
                react_1.default.createElement("div", { className: "horizontal space-between margin-top-s" },
                    react_1.default.createElement(react_2.DefaultButton, { disabled: !name || isTaken, onClick: handleImport }, "Import File"),
                    react_1.default.createElement(react_2.PrimaryButton, { disabled: !name || isTaken, onClick: handleSubmit }, "Create New"))))) : null));
}
exports["default"] = NewConfigButton;


/***/ }),

/***/ 4630:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const react_2 = __webpack_require__(85411);
const classnames_1 = __importDefault(__webpack_require__(94184));
function SensitivitySelector({ dispatch, disabled, readOnly, sensitivity }) {
    const handleChange = (0, react_1.useCallback)((e, newValue = '50') => {
        let int = parseInt(newValue, 10);
        if (isNaN(int)) {
            int = 1;
        }
        else {
            int = 100 - int;
        }
        dispatch({
            type: 'updateSensitivity',
            sensitivity: int,
        });
    }, [dispatch]);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(react_2.SpinButton, { label: "Mouse movement sensitivity (1-99)", className: (0, classnames_1.default)(readOnly && 'no-pointer-events'), labelPosition: react_2.Position.top, disabled: disabled, onChange: readOnly ? undefined : handleChange, value: disabled ? 'N/A' : (100 - sensitivity).toString(), min: 1, max: 99 }),
        react_1.default.createElement("small", null, "You may need to configure the sensitivity in the in-game settings as well (as well as turn off any \"deadzone\" options in-game).")));
}
exports["default"] = SensitivitySelector;


/***/ }),

/***/ 70429:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(85411);
const react_2 = __importStar(__webpack_require__(67294));
function ShortcutCommandsList() {
    const [commands, setCommands] = (0, react_2.useState)(null);
    (0, react_2.useEffect)(() => {
        chrome.commands.getAll().then(setCommands);
    }, []);
    return (react_2.default.createElement("section", null,
        react_2.default.createElement("h3", null, "Shortcuts"),
        !commands ? (react_2.default.createElement(react_1.Shimmer, null)) : (react_2.default.createElement("div", null,
            commands.map((command) => {
                const htmlId = `command-${command.name}`;
                return (react_2.default.createElement("div", { key: command.name, className: "margin-bottom" },
                    react_2.default.createElement(react_1.Label, { htmlFor: htmlId }, command.description),
                    react_2.default.createElement(react_1.Text, { id: htmlId, className: "command-keys" }, command.shortcut)));
            }),
            react_2.default.createElement(react_1.Link, { href: "#", underline: true, onClick: () => chrome.tabs.create({
                    url: 'chrome://extensions/shortcuts',
                }) }, "Change on the Extensions page...")))));
}
exports["default"] = ShortcutCommandsList;


/***/ }),

/***/ 13869:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const react_2 = __webpack_require__(85411);
const classnames_1 = __importDefault(__webpack_require__(94184));
const size = { width: 20, height: 20 };
const options = [
    {
        key: '-1',
        imageSrc: '/images/empty-set.svg',
        selectedImageSrc: '/images/empty-set.svg',
        imageAlt: 'None',
        imageSize: size,
        text: 'None',
    },
    {
        key: '0',
        imageSrc: '/images/circle.svg',
        selectedImageSrc: '/images/circle.svg',
        imageAlt: 'Left Stick',
        imageSize: size,
        text: 'Left',
    },
    {
        key: '1',
        imageSrc: '/images/circle.svg',
        selectedImageSrc: '/images/circle.svg',
        imageAlt: 'Right Stick',
        imageSize: size,
        text: 'Right',
    },
];
function StickSelector({ disabled, stick, onChange, readOnly }) {
    const handleChange = (0, react_1.useCallback)((ev, option) => {
        const key = option && option.key;
        const num = key === '0' ? 0 : key === '1' ? 1 : undefined;
        onChange(num);
    }, [onChange]);
    return (react_1.default.createElement(react_2.ChoiceGroup, { className: (0, classnames_1.default)(readOnly && 'no-pointer-events'), disabled: disabled, label: "Mouse movement controls which analog stick?", selectedKey: stick === 0 ? '0' : stick === 1 ? '1' : '-1', onChange: readOnly ? undefined : handleChange, options: options }));
}
exports["default"] = StickSelector;


/***/ }),

/***/ 77516:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const react_1 = __webpack_require__(85411);
const react_2 = __importStar(__webpack_require__(67294));
const react_redux_1 = __webpack_require__(85656);
const react_responsive_modal_1 = __webpack_require__(6032);
const payments_1 = __webpack_require__(72133);
const actions_1 = __webpack_require__(48911);
const selectors_1 = __webpack_require__(83522);
const reduxHooks_1 = __webpack_require__(97121);
const extpay = (0, payments_1.getExtPay)();
// TODO pull this from a server
const price = '$3.99';
function UpsellModal() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const show = (0, reduxHooks_1.useAppSelector)(selectors_1.getUpsellModalVisibility);
    const openPaymentPage = (0, react_2.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        yield extpay.openPaymentPage();
        setTimeout(() => {
            window.close();
        }, 100);
    }), []);
    const handleClose = (0, react_2.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        dispatch((0, actions_1.showUpsellModalAction)(false));
    }), [dispatch]);
    return (react_2.default.createElement(react_responsive_modal_1.Modal, { center: true, open: show, onClose: handleClose, showCloseIcon: true, focusTrapped: true, closeOnEsc: true },
        react_2.default.createElement("div", { className: "explanation-modal-xmnk" },
            react_2.default.createElement("h2", null, "Upgrade for additional features"),
            react_2.default.createElement("p", null,
                react_2.default.createElement("strong", null, "Pay once - access these premium features forever!")),
            react_2.default.createElement("ul", null,
                react_2.default.createElement("li", null, "Create additional presets"),
                react_2.default.createElement("li", null, "Import community-made presets for existing games"),
                react_2.default.createElement("li", null, "More features coming soon")),
            react_2.default.createElement("div", { style: { textAlign: 'center' } },
                react_2.default.createElement(react_1.CompoundButton, { primary: true, secondaryText: `Only ${price}`, onClick: openPaymentPage, styles: { root: { width: '100%' }, textContainer: { textAlign: 'center' } } }, "Upgrade now")))));
}
exports["default"] = UpsellModal;


/***/ }),

/***/ 97121:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useAppSelector = exports.useAppDispatch = void 0;
const react_redux_1 = __webpack_require__(85656);
// Use throughout your app instead of plain `useDispatch` and `useSelector`
const useAppDispatch = () => (0, react_redux_1.useDispatch)();
exports.useAppDispatch = useAppDispatch;
exports.useAppSelector = react_redux_1.useSelector;


/***/ }),

/***/ 78720:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(67294);
const actions_1 = __webpack_require__(48911);
const selectors_1 = __webpack_require__(83522);
const reduxHooks_1 = __webpack_require__(97121);
function useGameStatus() {
    const { gameName, status } = (0, reduxHooks_1.useAppSelector)(selectors_1.getGameName);
    // fetch data if not present
    const dispatch = (0, reduxHooks_1.useAppDispatch)();
    (0, react_1.useEffect)(() => {
        if (status === 'idle') {
            dispatch((0, actions_1.fetchGameStatusAction)());
        }
    }, [dispatch, status]);
    return { gameName, status };
}
exports["default"] = useGameStatus;


/***/ }),

/***/ 42411:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(67294);
const actions_1 = __webpack_require__(48911);
const selectors_1 = __webpack_require__(83522);
const reduxHooks_1 = __webpack_require__(97121);
function useGamepadConfigs() {
    const { configs, status, error } = (0, reduxHooks_1.useAppSelector)(selectors_1.getAllGamepadConfigs);
    const activeConfig = (0, reduxHooks_1.useAppSelector)(selectors_1.getActiveConfigName);
    const isEnabled = (0, reduxHooks_1.useAppSelector)(selectors_1.getIsEnabled);
    // fetch data if not present
    const dispatch = (0, reduxHooks_1.useAppDispatch)();
    (0, react_1.useEffect)(() => {
        if (status === 'idle') {
            // fetch all stored data
            dispatch((0, actions_1.fetchAllAction)())
                .unwrap() // https://redux-toolkit.js.org/api/createAsyncThunk#handling-thunk-results
                .then((_resp) => {
                // request updated payment info
                dispatch((0, actions_1.fetchPaymentAction)());
            });
        }
    }, [dispatch, status]);
    return { activeConfig, configs, isEnabled, status, error };
}
exports["default"] = useGamepadConfigs;


/***/ }),

/***/ 58750:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(67294);
function useIsMounted() {
    const isMounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    return (0, react_1.useCallback)(() => isMounted.current, []);
}
exports["default"] = useIsMounted;


/***/ }),

/***/ 67383:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(67294);
const deep_equal_1 = __importDefault(__webpack_require__(10251));
const gamepadConfig_1 = __webpack_require__(4053);
function getInitialState(initialGamepadConfig) {
    return {
        config: initialGamepadConfig,
        errors: { hasErrors: false, keyConfig: {}, mouseConfig: {} },
        changes: {
            mouseConfig: false,
            keyConfig: false,
        },
    };
}
function keyConfigReducer(initialState, state, action) {
    if (action.type === 'reset') {
        return getInitialState(action.config);
    }
    if (action.type === 'updateKeyConfig') {
        const updated = Object.assign(Object.assign({}, state), { config: Object.assign(Object.assign({}, state.config), { keyConfig: Object.assign(Object.assign({}, state.config.keyConfig), { [action.button]: Array.isArray(action.keyMap) && !action.keyMap.length ? undefined : action.keyMap }) }) });
        const { invalidButtons, hasErrors } = (0, gamepadConfig_1.processGamepadConfig)(updated.config.keyConfig);
        const hasKeyConfigChanges = !(0, deep_equal_1.default)(initialState.config.keyConfig, updated.config.keyConfig);
        updated.changes = Object.assign(Object.assign({}, updated.changes), { keyConfig: hasKeyConfigChanges });
        // Still allow update if there are errors, but we will block submit
        updated.errors = Object.assign(Object.assign({}, updated.errors), { keyConfig: invalidButtons, hasErrors: Object.keys(state.errors.mouseConfig).length > 0 || hasErrors });
        return updated;
    }
    if (action.type === 'updateSensitivity' || action.type === 'updateMouseControls') {
        const { type } = action, other = __rest(action, ["type"]);
        const mouseConfig = Object.assign(Object.assign({}, state.config.mouseConfig), other);
        const { errors, hasErrors } = (0, gamepadConfig_1.validateMouseConfig)(mouseConfig);
        const hasMouseConfigChanges = !(0, deep_equal_1.default)(initialState.config.mouseConfig, mouseConfig);
        const updated = Object.assign(Object.assign({}, state), { changes: Object.assign(Object.assign({}, state.changes), { mouseConfig: hasMouseConfigChanges }), config: Object.assign(Object.assign({}, state.config), { mouseConfig }), errors: Object.assign(Object.assign({}, state.errors), { mouseConfig: Object.assign({}, errors), hasErrors: Object.keys(state.errors.keyConfig).length > 0 || hasErrors }) });
        return updated;
    }
    throw new Error('Unexpected action type');
}
function useKeyConfigEditorState(initialGamepadConfig) {
    const initialState = (0, react_1.useMemo)(() => getInitialState(initialGamepadConfig), [initialGamepadConfig]);
    const reducer = (0, react_1.useCallback)((state, action) => {
        return keyConfigReducer(initialState, state, action);
    }, [initialState]);
    return (0, react_1.useReducer)(reducer, initialState);
}
exports["default"] = useKeyConfigEditorState;


/***/ }),

/***/ 44140:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fluentXboxHeaderTheme = exports.fluentXboxTheme = exports.xboxColor = void 0;
const react_1 = __webpack_require__(85411);
exports.xboxColor = '#38a11b';
// https://github.com/microsoft/fluentui/wiki/How-to-apply-theme-to-Fluent-UI-React-components
// https://fluentuipr.z22.web.core.windows.net/heads/master/theming-designer/index.html
exports.fluentXboxTheme = (0, react_1.createTheme)({
    palette: {
        themePrimary: '#218f35',
        themeLighterAlt: '#f3fbf4',
        themeLighter: '#d0edd5',
        themeLight: '#aaddb4',
        themeTertiary: '#65bc75',
        themeSecondary: '#329c46',
        themeDarkAlt: '#1e8130',
        themeDark: '#196d28',
        themeDarker: '#12501e',
        neutralLighterAlt: '#ecebe9',
        neutralLighter: '#e8e7e6',
        neutralLight: '#dedddc',
        neutralQuaternaryAlt: '#cfcecd',
        neutralQuaternary: '#c6c5c4',
        neutralTertiaryAlt: '#bebdbc',
        neutralTertiary: '#bab8b7',
        neutralSecondary: '#a3a2a0',
        neutralPrimaryAlt: '#8d8b8a',
        neutralPrimary: '#323130',
        neutralDark: '#605e5d',
        black: '#494847',
        white: '#f3f2f1',
    },
});
exports.fluentXboxHeaderTheme = {
    palette: {
        themePrimary: '#00260e',
        themeLighterAlt: '#000502',
        themeLighter: '#000903',
        themeLight: '#000d05',
        themeTertiary: '#001106',
        themeSecondary: '#001508',
        themeDarkAlt: '#001a09',
        themeDark: '#001e0b',
        themeDarker: '#00220c',
        neutralLighterAlt: '#208b34',
        neutralLighter: '#1f8933',
        neutralLight: '#1e8331',
        neutralQuaternaryAlt: '#1c7a2d',
        neutralQuaternary: '#1b752b',
        neutralTertiaryAlt: '#1a702a',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#218f35',
    },
    semanticColors: {
        menuBackground: exports.fluentXboxTheme.semanticColors.menuBackground,
        menuDivider: exports.fluentXboxTheme.semanticColors.menuDivider,
        menuItemText: exports.fluentXboxTheme.semanticColors.menuItemText,
        menuItemTextHovered: exports.fluentXboxTheme.semanticColors.menuItemTextHovered,
        menuItemBackgroundHovered: exports.fluentXboxTheme.semanticColors.menuItemBackgroundHovered,
        menuItemBackgroundPressed: exports.fluentXboxTheme.semanticColors.menuItemBackgroundPressed,
        menuIcon: exports.fluentXboxTheme.semanticColors.menuIcon,
        menuHeader: exports.fluentXboxTheme.semanticColors.menuHeader,
    },
};


/***/ }),

/***/ 48911:
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
exports.updatePrefsAction = exports.modifyGamepadConfigAction = exports.deleteGamepadConfigAction = exports.disableGamepadConfigAction = exports.activateGamepadConfigAction = exports.fetchPaymentAction = exports.fetchAllAction = exports.fetchGameStatusAction = exports.showUpsellModalAction = void 0;
const toolkit_1 = __webpack_require__(54680);
const gamepadConfig_1 = __webpack_require__(4053);
const messages_1 = __webpack_require__(28724);
const selectors_1 = __webpack_require__(83522);
const chromeStoredData_1 = __webpack_require__(8555);
const payments_1 = __webpack_require__(72133);
const messageUtils_1 = __webpack_require__(5879);
const extpay = (0, payments_1.getExtPay)();
exports.showUpsellModalAction = (0, toolkit_1.createAction)('upsellModal/show');
exports.fetchGameStatusAction = (0, toolkit_1.createAsyncThunk)('meta/gameStatus', chromeStoredData_1.getLocalGameStatus);
exports.fetchAllAction = (0, toolkit_1.createAsyncThunk)('config/fetchAll', chromeStoredData_1.getAllStoredSync);
exports.fetchPaymentAction = (0, toolkit_1.createAsyncThunk)('payment/fetch', () => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield extpay.getUser();
    return {
        paid: user.paid,
        paidAt: user.paidAt && user.paidAt.getTime(),
        installedAt: user.installedAt.getTime(),
    };
}));
function _setActiveConfig(name, state) {
    return __awaiter(this, void 0, void 0, function* () {
        const { config: gamepadConfig } = (0, selectors_1.getGamepadConfig)(state, name);
        if (!gamepadConfig)
            throw new Error('Missing gamepad config cache');
        return yield (0, messageUtils_1.setActiveConfig)(name, gamepadConfig);
    });
}
exports.activateGamepadConfigAction = (0, toolkit_1.createAsyncThunk)('config/activate', ({ name }, { getState }) => _setActiveConfig(name, getState()));
exports.disableGamepadConfigAction = (0, toolkit_1.createAsyncThunk)('config/disable', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, messageUtils_1.sendMessage)((0, messages_1.disableGamepadMsg)());
    yield (0, chromeStoredData_1.storeGamepadConfigEnabled)(false);
}));
exports.deleteGamepadConfigAction = (0, toolkit_1.createAsyncThunk)('config/delete', ({ name }, { getState }) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    if ((0, selectors_1.isConfigActive)(getState(), name)) {
        // We are deleting the active config, so activate default instead
        promises.push(_setActiveConfig(gamepadConfig_1.DEFAULT_CONFIG_NAME, getState()));
    }
    yield Promise.all([...promises, (0, chromeStoredData_1.deleteGamepadConfig)(name)]);
    return { name };
}));
exports.modifyGamepadConfigAction = (0, toolkit_1.createAsyncThunk)('config/modify', ({ name, gamepadConfig }, { getState }) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, selectors_1.isConfigActive)(getState(), name)) {
        // Update the active config on page
        yield (0, messageUtils_1.sendMessage)((0, messages_1.activateGamepadConfigMsg)(name, gamepadConfig));
    }
    yield (0, chromeStoredData_1.storeGamepadConfig)(name, gamepadConfig);
    return { name, gamepadConfig };
}));
// Sends the updated prefs (without waiting)
const updatePrefsAction = (prefs) => {
    // TODO should we just make this createAsyncThunk and await here?
    (0, messageUtils_1.sendMessage)((0, messages_1.updatePrefsMsg)(prefs));
    (0, chromeStoredData_1.storeGlobalPrefs)(prefs);
    return { type: 'prefs/update', payload: prefs };
};
exports.updatePrefsAction = updatePrefsAction;


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

/***/ 66133:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pendingStatusesReducer = exports.prefsReducer = exports.paymentReducer = exports.configDetailsReducer = exports.enabledReducer = exports.activeConfigReducer = exports.currentGameReducer = exports.upsellModalVisibilityReducer = void 0;
const toolkit_1 = __webpack_require__(54680);
const gamepadConfig_1 = __webpack_require__(4053);
const actions_1 = __webpack_require__(48911);
const defaults_1 = __webpack_require__(53201);
exports.upsellModalVisibilityReducer = (0, toolkit_1.createReducer)(false, (builder) => {
    builder.addCase(actions_1.showUpsellModalAction, (state, action) => action.payload);
});
exports.currentGameReducer = (0, toolkit_1.createReducer)(null, (builder) => {
    builder.addCase(actions_1.fetchGameStatusAction.fulfilled, (state, action) => action.payload || null);
});
exports.activeConfigReducer = (0, toolkit_1.createReducer)(gamepadConfig_1.DEFAULT_CONFIG_NAME, (builder) => {
    builder.addCase(actions_1.fetchAllAction.fulfilled, (state, action) => {
        return action.payload.activeConfig;
    });
    builder.addCase(actions_1.activateGamepadConfigAction.fulfilled, (state, action) => {
        return action.payload.name;
    });
});
exports.enabledReducer = (0, toolkit_1.createReducer)(true, (builder) => {
    builder.addCase(actions_1.fetchAllAction.fulfilled, (state, action) => {
        return action.payload.isEnabled;
    });
    builder.addCase(actions_1.activateGamepadConfigAction.fulfilled, () => {
        return true;
    });
    builder.addCase(actions_1.disableGamepadConfigAction.fulfilled, () => {
        return false;
    });
});
exports.configDetailsReducer = (0, toolkit_1.createReducer)({
    [gamepadConfig_1.DEFAULT_CONFIG_NAME]: gamepadConfig_1.defaultGamepadConfig,
}, (builder) => {
    builder.addCase(actions_1.fetchAllAction.fulfilled, (state, action) => {
        return action.payload.configs;
    });
    builder.addCase(actions_1.deleteGamepadConfigAction.fulfilled, (state, action) => {
        delete state[action.payload.name];
    });
    builder.addCase(actions_1.modifyGamepadConfigAction.fulfilled, (state, action) => {
        state[action.payload.name] = action.payload.gamepadConfig;
    });
});
exports.paymentReducer = (0, toolkit_1.createReducer)(null, (builder) => {
    builder.addCase(actions_1.fetchAllAction.fulfilled, (state, action) => action.payload.payment || null);
    builder.addCase(actions_1.fetchPaymentAction.fulfilled, (state, action) => action.payload || state);
});
exports.prefsReducer = (0, toolkit_1.createReducer)(defaults_1.defaultPrefs, (builder) => {
    builder.addCase(actions_1.fetchAllAction.fulfilled, (state, action) => {
        return action.payload.prefs || state;
    });
    // TODO better type safety
    builder.addCase('prefs/update', (state, action) => action.payload);
});
function isWriteAction(action) {
    return (action.type.startsWith(actions_1.deleteGamepadConfigAction.typePrefix) ||
        action.type.startsWith(actions_1.modifyGamepadConfigAction.typePrefix));
}
exports.pendingStatusesReducer = (0, toolkit_1.createReducer)({
    readAll: 'idle',
    gameStatus: 'idle',
    payment: 'idle',
    configs: {},
}, (builder) => {
    builder.addCase(actions_1.fetchAllAction.pending, (state) => {
        state.readAll = 'reading';
    });
    builder.addCase(actions_1.fetchAllAction.fulfilled, (state, action) => {
        var _a;
        state.readAll = 'success';
        if ((_a = action.payload.payment) === null || _a === void 0 ? void 0 : _a.paid) {
            state.payment = 'success';
        }
    });
    builder.addCase(actions_1.fetchAllAction.rejected, (state, action) => {
        state.readAll = 'failure';
        state.readAllError = action.error;
    });
    builder.addCase(actions_1.fetchGameStatusAction.pending, (state) => {
        state.gameStatus = 'reading';
    });
    builder.addCase(actions_1.fetchGameStatusAction.fulfilled, (state) => {
        state.gameStatus = 'success';
    });
    builder.addCase(actions_1.fetchGameStatusAction.rejected, (state) => {
        state.gameStatus = 'failure';
    });
    builder.addCase(actions_1.fetchPaymentAction.pending, (state) => {
        state.payment = 'reading';
    });
    builder.addCase(actions_1.fetchPaymentAction.fulfilled, (state) => {
        state.payment = 'success';
    });
    builder.addCase(actions_1.fetchPaymentAction.rejected, (state) => {
        state.payment = 'failure';
    });
    builder.addMatcher((action) => isWriteAction(action) && (0, toolkit_1.isPending)(action), (state, action) => {
        state.configs[action.meta.arg.name] = 'writing';
    });
    builder.addMatcher((action) => isWriteAction(action) && (0, toolkit_1.isFulfilled)(action), (state, action) => {
        state.configs[action.payload.name] = 'success';
    });
    builder.addMatcher((action) => isWriteAction(action) && (0, toolkit_1.isRejected)(action), (state, action) => {
        if (action.payload) {
            state.configs[action.payload.name] = 'failure';
        }
    });
});


/***/ }),

/***/ 83522:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getGlobalPrefs = exports.getUpsellModalVisibility = exports.getPayment = exports.getGameName = exports.isConfigActive = exports.getActiveConfigName = exports.getIsEnabled = exports.getGamepadConfig = exports.getAllGamepadConfigs = void 0;
const payments_1 = __webpack_require__(72133);
const getAllGamepadConfigs = (state) => {
    return {
        configs: state.configs,
        status: state.pending.readAll,
        error: state.pending.readAllError,
    };
};
exports.getAllGamepadConfigs = getAllGamepadConfigs;
const getGamepadConfig = (state, name) => {
    return {
        config: state.configs[name],
        status: state.pending.configs[name],
    };
};
exports.getGamepadConfig = getGamepadConfig;
const getIsEnabled = (state) => {
    return state.enabled;
};
exports.getIsEnabled = getIsEnabled;
const getActiveConfigName = (state) => {
    return state.active;
};
exports.getActiveConfigName = getActiveConfigName;
const isConfigActive = (state, name) => {
    return (0, exports.getActiveConfigName)(state) === name;
};
exports.isConfigActive = isConfigActive;
const getGameName = (state) => {
    return {
        gameName: state.gameName,
        status: state.pending.gameStatus,
    };
};
exports.getGameName = getGameName;
const getPayment = (state) => {
    return state.payment || payments_1.notPaidPayment;
};
exports.getPayment = getPayment;
const getUpsellModalVisibility = (state) => {
    return state.upsellModalVisibility;
};
exports.getUpsellModalVisibility = getUpsellModalVisibility;
const getGlobalPrefs = (state) => {
    return state.prefs;
};
exports.getGlobalPrefs = getGlobalPrefs;


/***/ }),

/***/ 3954:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.store = void 0;
const toolkit_1 = __webpack_require__(54680);
const redux_logger_1 = __importDefault(__webpack_require__(94500));
const reducers_1 = __webpack_require__(66133);
exports.store = (0, toolkit_1.configureStore)({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat( true ? [] : 0),
    reducer: {
        gameName: reducers_1.currentGameReducer,
        enabled: reducers_1.enabledReducer,
        active: reducers_1.activeConfigReducer,
        configs: reducers_1.configDetailsReducer,
        payment: reducers_1.paymentReducer,
        pending: reducers_1.pendingStatusesReducer,
        upsellModalVisibility: reducers_1.upsellModalVisibilityReducer,
        prefs: reducers_1.prefsReducer,
    },
});


/***/ }),

/***/ 99893:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.confirm = void 0;
function isSafari() {
    // https://stackoverflow.com/a/23522755
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function confirm(message) {
    // TODO move to a react modal based approach?
    if (isSafari()) {
        // Safari does not support "confirm" inside a popup, so we default to assuming
        // the user allowed the action.
        return true;
    }
    return window.confirm(message);
}
exports.confirm = confirm;


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

/***/ 85750:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.importConfig = exports.exportConfig = void 0;
const gamepadConfig_1 = __webpack_require__(4053);
const INPUT_ID = 'import-json-input';
function exportConfig(config, name) {
    // https://stackoverflow.com/a/65939108/2359478
    const blob = new Blob([JSON.stringify(config)], { type: 'text/json' });
    const link = document.createElement('a');
    link.download = `xcloud_preset_${name || 'game'}.json`;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ['text/json', link.download, link.href].join(':');
    const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    link.dispatchEvent(evt);
    link.remove();
}
exports.exportConfig = exportConfig;
function importConfig() {
    // Ask user to select JSON file
    // Parse it, and show error if failed
    let input = document.getElementById(INPUT_ID);
    if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.id = INPUT_ID;
        input.accept = '.json';
        input.style.display = 'none';
        document.body.appendChild(input);
    }
    input.click();
    return new Promise((resolve, reject) => {
        input.onchange = function fileSelected() {
            if (!input.files || !input.files[0]) {
                return reject('Please select a file');
            }
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = function receivedText(e) {
                const lines = e.target.result;
                let isValid = false;
                let config = null;
                try {
                    const json = JSON.parse(lines);
                    isValid = (0, gamepadConfig_1.isGamepadConfigValid)(json);
                    (0, gamepadConfig_1.upgradeOldGamepadConfig)(json);
                    config = json;
                }
                catch (e) {
                    isValid = false;
                }
                if (!isValid || !config) {
                    return reject('Preset data is not valid');
                }
                return resolve(config);
            };
            reader.readAsText(file);
        };
    }).finally(() => {
        input.remove();
    });
}
exports.importConfig = importConfig;


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

/***/ 51548:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(67294));
const react_dom_1 = __importDefault(__webpack_require__(73935));
const react_redux_1 = __webpack_require__(85656);
const react_2 = __webpack_require__(85411);
const Icons_1 = __webpack_require__(10955);
const theme_1 = __webpack_require__(44140);
const Popup_1 = __importDefault(__webpack_require__(81018));
const store_1 = __webpack_require__(3954);
const messages_1 = __webpack_require__(28724);
/*
 * Page rendered when the user clicks the action button in their toolbar.
 */
(0, Icons_1.initializeIcons)();
react_dom_1.default.render(react_1.default.createElement(react_1.StrictMode, null,
    react_1.default.createElement(react_redux_1.Provider, { store: store_1.store },
        react_1.default.createElement(react_2.ThemeProvider, { theme: theme_1.fluentXboxTheme },
            react_1.default.createElement(Popup_1.default, null)))), document.getElementById('root'));
chrome.runtime.onMessage.addListener((msg, sender) => {
    // Receives messages from the background service worker
    if (sender.tab)
        return false;
    if (msg.type === messages_1.MessageTypes.CLOSE_WINDOW) {
        console.log('Closing popup');
        window.close();
        return false;
    }
    return false;
});


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

/***/ 24654:
/***/ (() => {

/* (ignored) */

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
/******/ 			id: moduleId,
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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
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
/******/ 	/* webpack/runtime/runtimeId */
/******/ 	(() => {
/******/ 		__webpack_require__.j = 42;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			42: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkxcloud_keyboard_mouse"] = self["webpackChunkxcloud_keyboard_mouse"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [736], () => (__webpack_require__(51548)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;