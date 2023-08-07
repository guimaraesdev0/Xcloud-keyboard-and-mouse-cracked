/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 34988:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.disableConfig = exports.enableConfig = exports.mouseTriggerListener = void 0;
const gamepadConfig_1 = __webpack_require__(4053);
const gamepadSimulator_1 = __webpack_require__(72701);
const types_1 = __webpack_require__(42388);
const state_1 = __webpack_require__(71180);
const mouseButtonCodes = (0, types_1.getAllEnumKeys)(types_1.MouseButtons);
const scrollCodes = ['ScrollUp', 'ScrollDown'];
const listeners = {
    keydown: null,
    keyup: null,
    pointerlockchange: null,
    mousemove: null,
    mousedown: null,
    mouseup: null,
    wheel: null,
    contextmenu: null,
};
const getParentElement = () => {
    return document.querySelector("[data-active='ui-container']") || document.body;
};
const mouseLockError = () => {
    state_1.store.dispatch(state_1.actions.setListening('error'));
};
function listenMouseMove(axe = 1, sensitivity = gamepadConfig_1.DEFAULT_SENSITIVITY) {
    let stopMovingTimer;
    let needRaf = true; // used for requestAnimationFrame to only trigger at 60fps
    let movementX = 0;
    let movementY = 0;
    const handleMouseMove = () => {
        needRaf = true;
        clearTimeout(stopMovingTimer);
        stopMovingTimer = setTimeout(() => {
            (0, gamepadSimulator_1.simulateAxeMove)(axe, 0, 0);
        }, 50);
        // trigger the joystick on move
        const clampedX = movementX === 0 ? 0 : Math.max(Math.min(movementX / sensitivity, 1), -1);
        const clampedY = movementY === 0 ? 0 : Math.max(Math.min(movementY / sensitivity, 1), -1);
        movementX = 0;
        movementY = 0;
        (0, gamepadSimulator_1.simulateAxeMove)(axe, clampedX, clampedY);
    };
    // Listen to mouse move - only added once pointer lock is engaged
    listeners.mousemove = function onMouseMove(e) {
        const { movementX: mx, movementY: my } = e;
        movementX += mx;
        movementY += my;
        if (needRaf) {
            needRaf = false;
            // Queue processing
            requestAnimationFrame(handleMouseMove);
        }
    };
    // Listen for pointer lock when user clicks on the target
    listeners.pointerlockchange = function onPointerLockChange() {
        if (!listeners.mousemove)
            return;
        if (document.pointerLockElement) {
            state_1.store.dispatch(state_1.actions.setListening('listening'));
            document.addEventListener('mousemove', listeners.mousemove);
        }
        else {
            clearTimeout(stopMovingTimer);
            document.removeEventListener('mousemove', listeners.mousemove);
            // show click element again
            state_1.store.dispatch(state_1.actions.setListening('not-listening'));
        }
    };
    document.addEventListener('pointerlockchange', listeners.pointerlockchange);
    document.addEventListener('pointerlockerror', mouseLockError);
    state_1.store.dispatch(state_1.actions.setListening('not-listening'));
}
function listenKeyboard(codeMapping) {
    let stopScrollTimer;
    let prevScrollCode = null;
    // Helper function
    const handleKeyEvent = (code, buttonFn, axisFn) => {
        const mapping = codeMapping[code];
        if (mapping) {
            if ((0, gamepadConfig_1.isButtonMapping)(mapping)) {
                const { gamepadIndex } = mapping;
                buttonFn(gamepadIndex);
            }
            else {
                const { axisIndex, axisDirection } = mapping;
                axisFn(axisIndex, axisDirection);
            }
            return true;
        }
        return false;
    };
    // Add keyboard press/unpress listeners
    listeners.keydown = function keyDown(e) {
        const event = e;
        if (event.repeat)
            return;
        const handled = handleKeyEvent(event.code, gamepadSimulator_1.simulateBtnPress, gamepadSimulator_1.simulateAxeDirPress);
        if (handled && e.cancelable)
            e.preventDefault();
    };
    listeners.keyup = function keyUp(e) {
        handleKeyEvent(e.code, gamepadSimulator_1.simulateBtnUnpress, gamepadSimulator_1.simulateAxeDirUnpress);
    };
    document.addEventListener('keydown', listeners.keydown);
    document.addEventListener('keyup', listeners.keyup);
    // Add mouse button listeners if there are any mouse button button bindings in the config
    if (mouseButtonCodes.some((buttonCode) => codeMapping[buttonCode])) {
        if (codeMapping.RightClick) {
            // For right click specificially make sure to supress the context menu
            // https://github.com/idolize/xcloud-keyboard-mouse/issues/37
            listeners.contextmenu = function contextMenu(e) {
                e.preventDefault();
            };
            document.addEventListener('contextmenu', listeners.contextmenu);
        }
        const parentElement = getParentElement();
        listeners.mousedown = function mouseDown(e) {
            const { button } = e;
            const buttonCode = types_1.MouseButtons[button];
            if (buttonCode) {
                const handled = handleKeyEvent(buttonCode, gamepadSimulator_1.simulateBtnPress, gamepadSimulator_1.simulateAxeDirPress);
                if (handled && e.cancelable)
                    e.preventDefault();
            }
        };
        listeners.mouseup = function mouseUp(e) {
            const { button } = e;
            const buttonCode = types_1.MouseButtons[button];
            if (buttonCode) {
                const handled = handleKeyEvent(buttonCode, gamepadSimulator_1.simulateBtnUnpress, gamepadSimulator_1.simulateAxeDirUnpress);
                if (handled && e.cancelable)
                    e.preventDefault();
            }
        };
        parentElement.addEventListener('mousedown', listeners.mousedown);
        parentElement.addEventListener('mouseup', listeners.mouseup);
    }
    // Add scroll listeners if there are any scroll bindins in the config
    if (scrollCodes.some((scrollCode) => codeMapping[scrollCode])) {
        const parentElement = getParentElement();
        listeners.wheel = function wheel(e) {
            const { deltaY } = e;
            const scrollCode = deltaY < 0 ? 'ScrollUp' : 'ScrollDown';
            if (prevScrollCode && prevScrollCode !== scrollCode) {
                // scroll direction changed, unpress the original "button" right away
                clearTimeout(stopScrollTimer);
                handleKeyEvent(prevScrollCode, gamepadSimulator_1.simulateBtnUnpress, gamepadSimulator_1.simulateAxeDirUnpress);
            }
            const handled = handleKeyEvent(scrollCode, gamepadSimulator_1.simulateBtnPress, gamepadSimulator_1.simulateAxeDirPress);
            prevScrollCode = scrollCode;
            if (handled) {
                if (e.cancelable)
                    e.preventDefault();
                clearTimeout(stopScrollTimer);
                stopScrollTimer = setTimeout(() => {
                    handleKeyEvent(scrollCode, gamepadSimulator_1.simulateBtnUnpress, gamepadSimulator_1.simulateAxeDirUnpress);
                }, 20);
            }
        };
        parentElement.addEventListener('wheel', listeners.wheel);
    }
}
function unlistenKeyboard() {
    // Remove any and all active listeners on the browser
    if (listeners.keydown) {
        document.removeEventListener('keydown', listeners.keydown);
    }
    if (listeners.keyup) {
        document.removeEventListener('keyup', listeners.keyup);
    }
    if (listeners.contextmenu) {
        document.removeEventListener('contextmenu', listeners.contextmenu);
    }
    const parentElement = getParentElement();
    if (listeners.mousedown) {
        parentElement.removeEventListener('mousedown', listeners.mousedown);
    }
    if (listeners.mouseup) {
        parentElement.removeEventListener('mouseup', listeners.mouseup);
    }
    if (listeners.wheel) {
        parentElement.removeEventListener('wheel', listeners.wheel);
    }
}
function unlistenMouseMove() {
    document.exitPointerLock();
    state_1.store.dispatch(state_1.actions.setListening('not-listening'));
}
function unlistenAll() {
    unlistenKeyboard();
    unlistenMouseMove();
}
function mouseTriggerListener(e) {
    // Note: make sure the game stream is still in focus or the game will pause input!
    e.preventDefault(); // prevent bluring when clicked
    const req = getParentElement().requestPointerLock();
    // This shouldn't be needed now with above preventDefault, but just to be safe...
    const doFocus = () => {
        const streamDiv = document.getElementById('game-stream');
        streamDiv === null || streamDiv === void 0 ? void 0 : streamDiv.focus();
    };
    if (req) {
        // Chrome returns a Promise here
        req.then(doFocus).catch(mouseLockError);
    }
    else {
        doFocus();
    }
}
exports.mouseTriggerListener = mouseTriggerListener;
function enableConfig(config) {
    const { mouseConfig, keyConfig } = config;
    const { codeMapping, invalidButtons, hasErrors } = (0, gamepadConfig_1.processGamepadConfig)(keyConfig);
    if (hasErrors) {
        // This should have been handled in the Popup UI, but just in case, we print error
        // and still proceed with the part of the config that is valid
        console.error('Invalid button mappings in gamepad config object', invalidButtons);
    }
    unlistenAll();
    listenKeyboard(codeMapping);
    if (mouseConfig.mouseControls !== undefined) {
        listenMouseMove(mouseConfig.mouseControls, mouseConfig.sensitivity);
    }
    (0, gamepadSimulator_1.enableSimulator)(true);
}
exports.enableConfig = enableConfig;
function disableConfig() {
    unlistenAll();
    (0, gamepadSimulator_1.enableSimulator)(false);
}
exports.disableConfig = disableConfig;


/***/ }),

/***/ 31115:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
exports.secondClickText = exports.firstClickText = void 0;
const react_1 = __webpack_require__(85411);
const classnames_1 = __importDefault(__webpack_require__(94184));
const react_2 = __importStar(__webpack_require__(67294));
const pageInjectUtils_1 = __webpack_require__(44660);
const browserEventProcessor_1 = __webpack_require__(34988);
exports.firstClickText = 'Click here to enable mouse control';
exports.secondClickText = 'Click again to enable mouse';
function MouseEnableTarget({ status, placement, onMinimize }) {
    const mouseText = status === 'error' ? exports.secondClickText : exports.firstClickText;
    const mouseImgSrc = (0, pageInjectUtils_1.getInjectedImagePath)('mouse.svg');
    const isNotSmall = placement !== 'small';
    const isCentered = placement === 'centered';
    const expandedStyle = { height: '1.5em' };
    const handleMouseDown = (0, react_2.useCallback)((e) => {
        (0, browserEventProcessor_1.mouseTriggerListener)(e.nativeEvent);
    }, []);
    const handleMinimize = (0, react_2.useCallback)((e) => {
        e.stopPropagation();
        e.preventDefault();
        onMinimize === null || onMinimize === void 0 ? void 0 : onMinimize();
    }, [onMinimize]);
    return isNotSmall && status === 'listening' ? null : (react_2.default.createElement(react_1.TooltipHost, { hidden: placement === 'centered', content: mouseText, id: "enable-mouse-tooltip" },
        react_2.default.createElement("div", { id: "click-to-enable-mouse-xmnk", className: (0, classnames_1.default)(isNotSmall && 'expanded-xmnk', isCentered ? 'centered-xmnk' : 'left-xmnk'), onMouseDown: status !== 'listening' ? handleMouseDown : undefined },
            react_2.default.createElement("img", { src: mouseImgSrc, style: isNotSmall ? expandedStyle : undefined }),
            isNotSmall ? react_2.default.createElement("div", null, mouseText) : null,
            isCentered && onMinimize ? (react_2.default.createElement("div", { className: "minimize-xmnk", onMouseDown: handleMinimize, title: "Show less" }, "-")) : null)));
}
exports["default"] = MouseEnableTarget;


/***/ }),

/***/ 26604:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
// only shows when the user goes to xcloud and uses the extension for the first time
const react_1 = __importStar(__webpack_require__(67294));
const react_responsive_modal_1 = __webpack_require__(6032);
const pageInjectUtils_1 = __webpack_require__(44660);
function OnboardingIntro({ onDismiss }) {
    const [canDismiss, setCanDismiss] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setTimeout(() => {
            setCanDismiss(true);
        }, 2200);
    }, []);
    const icon16 = (0, pageInjectUtils_1.getInjectedImagePath)('icon-16.png');
    const pinScreenshot = (0, pageInjectUtils_1.getInjectedImagePath)('pin-screenshot.png');
    return (react_1.default.createElement(react_responsive_modal_1.Modal, { center: true, open: true, onClose: onDismiss, showCloseIcon: false, focusTrapped: true, closeOnEsc: false, closeOnOverlayClick: false },
        react_1.default.createElement("div", { className: "explanation-modal-xmnk" },
            react_1.default.createElement("h1", null, "Welcome to Keyboard & Mouse for xCloud!"),
            react_1.default.createElement("p", null,
                react_1.default.createElement("strong", null, "Use the extension popup to configure the extension and set up your key bindings.")),
            react_1.default.createElement("p", null,
                "To access the extension popup, simply click the ",
                react_1.default.createElement("img", { src: icon16 }),
                " icon at the top right of your browser. If you do not see the ",
                react_1.default.createElement("img", { src: icon16 }),
                " icon in your extension toolbar, use the following steps to pin it:"),
            react_1.default.createElement("ol", null,
                react_1.default.createElement("li", null, "Click the extensions puzzle icon in the top-right of the browser toolbar"),
                react_1.default.createElement("li", null, "Click the pin icon next to the green xCloud mouse icon")),
            react_1.default.createElement("p", null,
                react_1.default.createElement("img", { src: pinScreenshot })),
            react_1.default.createElement("p", null,
                react_1.default.createElement("strong", null, "Other important notes:")),
            react_1.default.createElement("ul", null,
                react_1.default.createElement("li", null, "You may see a warning when launching a game on xCloud about no controller - just click \"Continue Anyway\""),
                react_1.default.createElement("li", null,
                    "Mouse control can be enabled by clicking the overlay that appears after launching a game, and can be exited by pressing the ",
                    react_1.default.createElement("kbd", null, "Esc"),
                    " key"),
                react_1.default.createElement("li", null,
                    "Mouse sensitivity can be changed in the extension popup, however for best results",
                    ' ',
                    react_1.default.createElement("u", null, "it is important to also tweak controler stick sensitivity and deadzone options inside each game's settings as well"))),
            react_1.default.createElement("div", { style: { textAlign: 'center' } },
                react_1.default.createElement("button", { className: "agree", disabled: !canDismiss, onClick: onDismiss }, "Understood")))));
}
exports["default"] = OnboardingIntro;


/***/ }),

/***/ 12993:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const classnames_1 = __importDefault(__webpack_require__(94184));
const react_1 = __importDefault(__webpack_require__(67294));
const react_redux_1 = __webpack_require__(85656);
const KeybindingsTable_1 = __importDefault(__webpack_require__(72208));
const pageInjectUtils_1 = __webpack_require__(44660);
const state_1 = __webpack_require__(71180);
const MouseEnableTarget_1 = __importDefault(__webpack_require__(31115));
const useLocalStorage_1 = __webpack_require__(23092);
function KeyboardOnlyIcon() {
    return react_1.default.createElement("img", { className: "left-xmnk", style: { opacity: 0.5 }, src: (0, pageInjectUtils_1.getInjectedImagePath)('keyboard.svg') });
}
function Toolbar() {
    var _a;
    // Using localstorage to avoid the complexity of message passing back to the extension storage
    const [isExpanded, setIsExpanded] = (0, useLocalStorage_1.useLocalStorage)('xmnk-toolbar-expanded', true);
    const mouse = (0, react_redux_1.useSelector)(state_1.selectors.selectMouse);
    const preset = (0, react_redux_1.useSelector)(state_1.selectors.selectPreset);
    const { showControlsOverlay } = (0, react_redux_1.useSelector)(state_1.selectors.selectPrefs);
    const increaseSize = () => setIsExpanded(true);
    const decreaseSize = () => setIsExpanded(false);
    const presetHasMouseControls = ((_a = preset.preset) === null || _a === void 0 ? void 0 : _a.mouseConfig.mouseControls) !== undefined;
    return preset.preset ? (react_1.default.createElement("div", { className: (0, classnames_1.default)(mouse.status === 'listening' && 'mouse-listening-xmnk', 'full-width-xmnk') },
        react_1.default.createElement("div", { className: (0, classnames_1.default)('header-xmnk', `header-xmnk-${isExpanded ? 'expanded' : 'minimized'}`, 'full-width-xmnk') },
            !isExpanded && presetHasMouseControls ? (
            // Small mouse is shown when minimized, regardless of controls overlay
            react_1.default.createElement(MouseEnableTarget_1.default, Object.assign({ placement: "small" }, mouse))) : showControlsOverlay ? (
            // Controls overlay shows keyboard fallback
            react_1.default.createElement(KeyboardOnlyIcon, null)) : null,
            isExpanded && showControlsOverlay ? react_1.default.createElement("div", { className: "preset-name-xmnk" },
                "Preset: ",
                preset.presetName) : null,
            showControlsOverlay || (!isExpanded && presetHasMouseControls) ? (react_1.default.createElement("div", { className: "size-buttons-xmnk" }, isExpanded ? (react_1.default.createElement("button", { onClick: decreaseSize, title: "Show less" }, "-")) : (react_1.default.createElement("button", { onClick: increaseSize, title: "Show more" }, "+")))) : null),
        isExpanded && showControlsOverlay && (react_1.default.createElement("div", { className: "keybindings-xmnk", style: !presetHasMouseControls || mouse.status === 'listening' ? { borderBottom: 'none' } : undefined },
            react_1.default.createElement(KeybindingsTable_1.default, { hideMissing: true, gamepadConfig: preset.preset }),
            react_1.default.createElement("div", { className: "explanation-xmnk" }, "To edit bindings use the toolbar button for the extension."))),
        isExpanded && presetHasMouseControls && (react_1.default.createElement(MouseEnableTarget_1.default, Object.assign({ placement: !showControlsOverlay ? 'centered' : 'docked' }, mouse, { onMinimize: decreaseSize }))))) : null;
}
exports["default"] = Toolbar;


/***/ }),

/***/ 23092:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useLocalStorage = void 0;
const react_1 = __webpack_require__(67294);
// https://usehooks.com/useLocalStorage/
function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = (0, react_1.useState)(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        }
        catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };
    return [storedValue, setValue];
}
exports.useLocalStorage = useLocalStorage;


/***/ }),

/***/ 74945:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderOnboardingIntro = void 0;
const react_1 = __importDefault(__webpack_require__(67294));
const react_dom_1 = __importDefault(__webpack_require__(73935));
const OnboardingIntro_1 = __importDefault(__webpack_require__(26604));
const ONBOARDING_ID = 'onboarding-xmnk';
function getOnboardingDiv() {
    let div = document.getElementById(ONBOARDING_ID);
    if (!div) {
        div = document.createElement('div');
        div.id = ONBOARDING_ID;
        document.body.appendChild(div);
    }
    return div;
}
function renderOnboardingIntro(onDismiss) {
    function handleDismiss() {
        onDismiss();
        react_dom_1.default.unmountComponentAtNode(getOnboardingDiv());
    }
    react_dom_1.default.render(react_1.default.createElement(OnboardingIntro_1.default, { onDismiss: handleDismiss }), getOnboardingDiv());
}
exports.renderOnboardingIntro = renderOnboardingIntro;


/***/ }),

/***/ 40883:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showToast = void 0;
const pageInjectUtils_1 = __webpack_require__(44660);
const SNACKBAR_ID = 'snackbar-xmnk';
const TOAST_TIME_MS = 3000;
let timeout;
function getSnackbarDiv() {
    let div = document.getElementById(SNACKBAR_ID);
    if (!div) {
        div = document.createElement('div');
        div.id = SNACKBAR_ID;
        const svg = document.createElement('img');
        svg.src = (0, pageInjectUtils_1.getInjectedImagePath)('keyboard.svg');
        div.appendChild(svg);
        const span = document.createElement('span');
        div.appendChild(span);
        document.body.appendChild(div);
    }
    return div;
}
function showToast(message) {
    clearTimeout(timeout);
    const snackbar = getSnackbarDiv();
    // Add the "show" class to DIV
    snackbar.classList.add('show');
    const span = snackbar.querySelector('span');
    span.innerText = message;
    // After 3 seconds, remove the show class from DIV
    timeout = setTimeout(() => {
        snackbar.classList.remove('show');
    }, TOAST_TIME_MS);
}
exports.showToast = showToast;


/***/ }),

/***/ 50905:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderToolbar = void 0;
const react_1 = __importDefault(__webpack_require__(67294));
const react_dom_1 = __importDefault(__webpack_require__(73935));
const react_redux_1 = __webpack_require__(85656);
const Toolbar_1 = __importDefault(__webpack_require__(12993));
const state_1 = __webpack_require__(71180);
const TOOLBAR_ID = 'toolbar-xmnk';
function getToolbarDiv() {
    let div = document.getElementById(TOOLBAR_ID);
    if (!div) {
        div = document.createElement('div');
        div.id = TOOLBAR_ID;
        document.body.appendChild(div);
    }
    return div;
}
function renderToolbar() {
    react_dom_1.default.render(react_1.default.createElement(react_redux_1.Provider, { store: state_1.store },
        react_1.default.createElement(Toolbar_1.default, null)), getToolbarDiv());
}
exports.renderToolbar = renderToolbar;


/***/ }),

/***/ 72701:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resetGamepadGlobals = exports.isEnabled = exports.enableSimulator = exports.modifyGamepadGlobals = exports.simulateGamepadDisconnect = exports.simulateGamepadConnect = exports.simulateAxeMove = exports.simulateAxeDirUnpress = exports.simulateAxeDirPress = exports.simulateBtnUnpress = exports.simulateBtnPress = exports.simulateBtnTouch = void 0;
const types_1 = __webpack_require__(42388);
let useFakeController = false;
const origGetGamepads = navigator.getGamepads.bind(navigator);
const fakeController = {
    axes: [0, 0, 0, 0],
    buttons: [
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
        {
            pressed: false,
            touched: false,
            value: 0,
        },
    ],
    connected: false,
    id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)',
    index: 0,
    mapping: 'standard',
    timestamp: performance.now(),
    hapticActuators: [],
};
const axeStates = {};
const getAxePosForDirection = (direction) => [types_1.Direction.UP, types_1.Direction.DOWN].indexOf(direction) > -1 ? 1 : 0;
const getOppositeDirection = (direction) => {
    switch (direction) {
        case types_1.Direction.UP:
            return types_1.Direction.DOWN;
        case types_1.Direction.DOWN:
            return types_1.Direction.UP;
        case types_1.Direction.LEFT:
            return types_1.Direction.RIGHT;
        case types_1.Direction.RIGHT:
            return types_1.Direction.LEFT;
    }
};
const getValueForDirection = (direction) => [types_1.Direction.UP, types_1.Direction.LEFT].indexOf(direction) > -1 ? -1 : 1;
function simulateBtnTouch(buttonIndex) {
    fakeController.buttons[buttonIndex].touched = true;
    fakeController.timestamp = performance.now();
}
exports.simulateBtnTouch = simulateBtnTouch;
function simulateBtnPress(buttonIndex) {
    fakeController.buttons[buttonIndex].pressed = true;
    fakeController.buttons[buttonIndex].value = 1;
    fakeController.timestamp = performance.now();
}
exports.simulateBtnPress = simulateBtnPress;
function simulateBtnUnpress(buttonIndex) {
    fakeController.buttons[buttonIndex].touched = false;
    fakeController.buttons[buttonIndex].pressed = false;
    fakeController.buttons[buttonIndex].value = 0;
    fakeController.timestamp = performance.now();
}
exports.simulateBtnUnpress = simulateBtnUnpress;
function simulateAxeDirPress(axe, direction) {
    axeStates[direction] = true;
    const pos = getAxePosForDirection(direction);
    const value = getValueForDirection(direction);
    const oppositeDirection = getOppositeDirection(direction);
    fakeController.axes[axe * 2 + pos] =
        value + (axeStates[oppositeDirection] ? getValueForDirection(oppositeDirection) : 0);
    fakeController.timestamp = performance.now();
}
exports.simulateAxeDirPress = simulateAxeDirPress;
function simulateAxeDirUnpress(axe, direction) {
    axeStates[direction] = false;
    const pos = getAxePosForDirection(direction);
    const oppositeDirection = getOppositeDirection(direction);
    fakeController.axes[axe * 2 + pos] = axeStates[oppositeDirection] ? getValueForDirection(oppositeDirection) : 0;
    fakeController.timestamp = performance.now();
}
exports.simulateAxeDirUnpress = simulateAxeDirUnpress;
function simulateAxeMove(axe, x, y) {
    fakeController.axes[axe * 2] = x;
    fakeController.axes[axe * 2 + 1] = y;
    fakeController.timestamp = performance.now();
}
exports.simulateAxeMove = simulateAxeMove;
function simulateGamepadConnect() {
    const event = new Event('gamepadconnected');
    fakeController.connected = true;
    fakeController.timestamp = performance.now();
    event.gamepad = fakeController;
    window.dispatchEvent(event);
}
exports.simulateGamepadConnect = simulateGamepadConnect;
function simulateGamepadDisconnect() {
    const event = new Event('gamepaddisconnected');
    fakeController.connected = false;
    fakeController.timestamp = performance.now();
    event.gamepad = fakeController;
    window.dispatchEvent(event);
}
exports.simulateGamepadDisconnect = simulateGamepadDisconnect;
function modifyGamepadGlobals() {
    navigator.getGamepads = function getGamepads() {
        return useFakeController ? [Object.assign({}, fakeController)] : origGetGamepads();
    };
}
exports.modifyGamepadGlobals = modifyGamepadGlobals;
function enableSimulator(enable) {
    // TODO Only reset back to the default gamepad if an actual controller is connected
    useFakeController = enable;
    if (enable) {
        simulateGamepadConnect();
    }
    else {
        simulateGamepadDisconnect();
    }
}
exports.enableSimulator = enableSimulator;
function isEnabled() {
    return useFakeController;
}
exports.isEnabled = isEnabled;
function resetGamepadGlobals() {
    navigator.getGamepads = origGetGamepads;
}
exports.resetGamepadGlobals = resetGamepadGlobals;


/***/ }),

/***/ 71180:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.selectors = exports.actions = exports.store = void 0;
const toolkit_1 = __webpack_require__(54680);
const defaults_1 = __webpack_require__(53201);
const initialPresetState = {
    presetName: null,
    preset: null,
};
const presetSlice = (0, toolkit_1.createSlice)({
    name: 'preset',
    initialState: initialPresetState,
    reducers: {
        updatePreset: (state, action) => {
            const { presetName, preset } = action.payload;
            state.presetName = presetName;
            state.preset = preset;
        },
    },
});
const initialMouseState = {
    status: 'not-listening',
};
const mouseSlice = (0, toolkit_1.createSlice)({
    name: 'mouse',
    initialState: initialMouseState,
    reducers: {
        setListening: (state, action) => {
            state.status = action.payload;
        },
    },
});
const prefsSlice = (0, toolkit_1.createSlice)({
    name: 'prefs',
    initialState: defaults_1.defaultPrefs,
    reducers: {
        updatePrefs: (state, action) => {
            return action.payload;
        },
    },
});
exports.store = (0, toolkit_1.configureStore)({
    reducer: {
        preset: presetSlice.reducer,
        mouse: mouseSlice.reducer,
        prefs: prefsSlice.reducer,
    },
});
exports.actions = Object.assign(Object.assign(Object.assign({}, mouseSlice.actions), presetSlice.actions), prefsSlice.actions);
exports.selectors = {
    selectMouse: (state) => state.mouse,
    selectPreset: (state) => state.preset,
    selectPrefs: (state) => state.prefs,
};


/***/ }),

/***/ 50502:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const browserEventProcessor_1 = __webpack_require__(34988);
const onboarding_1 = __webpack_require__(74945);
const snackbar_1 = __webpack_require__(40883);
const toolbar_1 = __webpack_require__(50905);
const gamepadSimulator_1 = __webpack_require__(72701);
const state_1 = __webpack_require__(71180);
const messages_1 = __webpack_require__(28724);
/*
 * This script is injected and run inside the browser page itself and thus
 * has no "isolated world" or sandboxing.
 * It uses window.postMessage to communicate with the content_script.
 */
const gameStartStopPollTimeMs = 1000;
let active = false;
let isXbox = false;
let interval;
// Setup gamepad shims right away in case the page script stores any references
(0, gamepadSimulator_1.modifyGamepadGlobals)();
function postMessageToWindow(msg) {
    window.postMessage(Object.assign(Object.assign({}, msg), { source: 'xcloud-page' }));
}
function getXboxGameInfo() {
    // e.g. "Halo Infinite | Xbox Cloud Gaming (Beta) on Xbox.com"
    // Page URL: https://www.xbox.com/en-US/play/launch/fortnite/BT5P2X999VH2
    const inGameUrlRegex = /^https:\/\/(www.)?xbox.com\/[\w-]+\/play\/launch\/[\w-]+\/([A-Z0-9]+)/i;
    const matches = window.location.href.match(inGameUrlRegex);
    if (matches && matches[1]) {
        const gameId = matches[1];
        const titleSplit = document.title.split(/\s+\|/);
        if (titleSplit.length === 2) {
            const gameName = titleSplit[0];
            return {
                gameName,
                gameId,
            };
        }
    }
    return null;
}
function checkIfInGame() {
    const { gameName, gameId } = getXboxGameInfo() || { gameName: null, gameId: null };
    let isInGame = !isXbox;
    if (isXbox) {
        // Headings only shown when there are errors, need sign in, or a menu is active
        const h1 = document.querySelector('h1');
        const closeBtn = document.querySelector("[data-id='ui-container'] [aria-label='Close']");
        const streamDiv = document.getElementById('game-stream');
        isInGame = !h1 && !closeBtn && !!streamDiv;
    }
    return {
        isInGame,
        gameName,
        gameId,
    };
}
// Disable the fake gamepad and let them use their real gamepad
function disableVirtualGamepad() {
    if ((0, gamepadSimulator_1.isEnabled)()) {
        (0, snackbar_1.showToast)('Mouse/keyboard disabled');
    }
    (0, browserEventProcessor_1.disableConfig)();
    state_1.store.dispatch(state_1.actions.updatePreset({ presetName: null, preset: null }));
}
// Update the active preset
function updateActiveGamepadConfig(name, config) {
    if (!name || !config) {
        disableVirtualGamepad();
        return;
    }
    (0, snackbar_1.showToast)(`'${name}' preset activated`);
    (0, browserEventProcessor_1.enableConfig)(config);
    state_1.store.dispatch(state_1.actions.updatePreset({ presetName: name, preset: config }));
}
function cancelEvent(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
}
function isValidMsgEvent(event) {
    if (event.source != window || !event.data || event.data.source !== 'xcloud-keyboard-mouse-content-script') {
        // We only accept messages from ourselves
        return false;
    }
    return true;
}
// Called when a message is received from the content script while in game
// (proxied from the background or popup scripts)
function messageListener(event) {
    if (!isValidMsgEvent(event)) {
        return;
    }
    const msg = event.data;
    // Got message from extension
    if (msg.type === messages_1.MessageTypes.INITIALIZE_RESPONSE) {
        if (!msg.seenOnboarding) {
            // Accounts for the case a user goes straight to a game page the first time they use the extension
            // (disables preset until they see onboaring and agree)
            (0, onboarding_1.renderOnboardingIntro)(() => {
                updateActiveGamepadConfig(msg.name, msg.gamepadConfig);
                postMessageToWindow((0, messages_1.seenOnboardingMsg)());
            });
        }
        else {
            updateActiveGamepadConfig(msg.name, msg.gamepadConfig);
        }
        state_1.store.dispatch(state_1.actions.updatePrefs(msg.prefs));
    }
    else if (msg.type === messages_1.MessageTypes.ACTIVATE_GAMEPAD_CONFIG) {
        updateActiveGamepadConfig(msg.name, msg.gamepadConfig);
    }
    else if (msg.type === messages_1.MessageTypes.UPDATE_PREFS) {
        state_1.store.dispatch(state_1.actions.updatePrefs(msg.prefs));
    }
}
// Called when the user stops playing a game
function handleGameEnded() {
    clearInterval(interval);
    window.removeEventListener('message', messageListener);
    document.removeEventListener('visibilitychange', cancelEvent);
    window.removeEventListener('focusout', cancelEvent);
    window.removeEventListener('blur', cancelEvent);
    // The user is no longer playing a game, so disable the virtual gamepad
    disableVirtualGamepad();
    postMessageToWindow((0, messages_1.gameChangedMsg)(null));
    // Begin listening again for a game to start
    pollForActiveGame();
}
// Called when the user starts playing a game
function handleGameStarted(gameName) {
    // Set up connection to content script via postMessage and listen for any response messages
    postMessageToWindow((0, messages_1.intializedMsg)(gameName));
    window.addEventListener('message', messageListener);
    // Prevent xCloud's unfocus listeners from triggering
    document.addEventListener('visibilitychange', cancelEvent);
    window.addEventListener('focusout', cancelEvent);
    window.addEventListener('blur', cancelEvent);
    // Periodically check if user leaves the game or opens a menu
    clearInterval(interval);
    interval = setInterval(() => {
        const { isInGame } = checkIfInGame();
        if (!isInGame) {
            handleGameEnded();
        }
    }, gameStartStopPollTimeMs);
}
// Periodically check if user enters a game
function pollForActiveGame() {
    clearInterval(interval);
    interval = setInterval(() => {
        const { isInGame, gameName } = checkIfInGame();
        if (isInGame) {
            clearInterval(interval);
            handleGameStarted(gameName);
        }
    }, gameStartStopPollTimeMs);
}
// Listen for an initial out-of-band message about onboarding
// (Only used if not on a game page yet, e.g. root xbox.com/play page)
function onboardingListner(event) {
    if (!isValidMsgEvent(event)) {
        return;
    }
    const msg = event.data;
    if (msg.type === messages_1.MessageTypes.SEEN_ONBOARDING) {
        window.removeEventListener('message', onboardingListner);
        if (msg.seen === false && !checkIfInGame().isInGame) {
            (0, onboarding_1.renderOnboardingIntro)(() => {
                postMessageToWindow((0, messages_1.seenOnboardingMsg)());
            });
        }
    }
}
function bootstrap() {
    if (active) {
        // Already running
        return;
    }
    // Considred active if either (1) not on an xbox page - like gamepad-tester, or (2) on xbox.com/play
    isXbox = /^https:\/\/(www.)?xbox.com/i.test(window.location.href);
    if (!isXbox || /^https:\/\/(www.)?xbox.com\/[\w-]+\/play/i.test(window.location.href)) {
        active = true;
        window.addEventListener('message', onboardingListner);
        postMessageToWindow((0, messages_1.injectedMsg)());
        (0, toolbar_1.renderToolbar)();
        pollForActiveGame();
    }
}
window.addEventListener('load', bootstrap, false);
// We need to use 'pageshow' here as well as 'load' because the 'load' event
// doesn't always trigger if the page is cached (e.g. pressing the back button)
window.addEventListener('pageshow', bootstrap, false);
// A few xbox pages use history.pushState to navigate to the /play URL,
// so we proxy that as well to be safe
window.history.pushState = new Proxy(window.history.pushState, {
    apply: (target, thisArg, argArray) => {
        const output = target.apply(thisArg, argArray);
        bootstrap();
        return output;
    },
});


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
/******/ 		__webpack_require__.j = 795;
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
/******/ 			795: 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [736], () => (__webpack_require__(50502)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;