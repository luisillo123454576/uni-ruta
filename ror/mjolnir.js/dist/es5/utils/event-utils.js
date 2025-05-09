"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffsetPosition = exports.whichButtons = void 0;
/* Constants */
var DOWN_EVENT = 1;
var MOVE_EVENT = 2;
var UP_EVENT = 4;
var MOUSE_EVENTS = {
    pointerdown: DOWN_EVENT,
    pointermove: MOVE_EVENT,
    pointerup: UP_EVENT,
    mousedown: DOWN_EVENT,
    mousemove: MOVE_EVENT,
    mouseup: UP_EVENT
};
// MouseEvent.button https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
var MOUSE_EVENT_BUTTON_LEFT = 0;
var MOUSE_EVENT_BUTTON_MIDDLE = 1;
var MOUSE_EVENT_BUTTON_RIGHT = 2;
// MouseEvent.buttons https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
var MOUSE_EVENT_BUTTONS_LEFT_MASK = 1;
var MOUSE_EVENT_BUTTONS_RIGHT_MASK = 2;
var MOUSE_EVENT_BUTTONS_MIDDLE_MASK = 4;
/**
 * Extract the involved mouse button
 */
function whichButtons(event) {
    var eventType = MOUSE_EVENTS[event.srcEvent.type];
    if (!eventType) {
        // Not a mouse evet
        return null;
    }
    var _a = event.srcEvent, buttons = _a.buttons, button = _a.button;
    var leftButton = false;
    var middleButton = false;
    var rightButton = false;
    if (eventType === MOVE_EVENT) {
        leftButton = Boolean(buttons & MOUSE_EVENT_BUTTONS_LEFT_MASK);
        middleButton = Boolean(buttons & MOUSE_EVENT_BUTTONS_MIDDLE_MASK);
        rightButton = Boolean(buttons & MOUSE_EVENT_BUTTONS_RIGHT_MASK);
    }
    else {
        leftButton = button === MOUSE_EVENT_BUTTON_LEFT;
        middleButton = button === MOUSE_EVENT_BUTTON_MIDDLE;
        rightButton = button === MOUSE_EVENT_BUTTON_RIGHT;
    }
    return { leftButton: leftButton, middleButton: middleButton, rightButton: rightButton };
}
exports.whichButtons = whichButtons;
/**
 * Calculate event position relative to the root element
 */
function getOffsetPosition(event, rootElement) {
    var center = event.center;
    // `center` is a hammer.js event property
    if (!center) {
        // Not a gestural event
        return null;
    }
    var rect = rootElement.getBoundingClientRect();
    // Fix scale for map affected by a CSS transform.
    // See https://stackoverflow.com/a/26893663/3528533
    var scaleX = rect.width / rootElement.offsetWidth || 1;
    var scaleY = rect.height / rootElement.offsetHeight || 1;
    // Calculate center relative to the root element
    var offsetCenter = {
        x: (center.x - rect.left - rootElement.clientLeft) / scaleX,
        y: (center.y - rect.top - rootElement.clientTop) / scaleY
    };
    return { center: center, offsetCenter: offsetCenter };
}
exports.getOffsetPosition = getOffsetPosition;
//# sourceMappingURL=event-utils.js.map