"use strict";
/**
 * This file contains overrides the default
 * hammer.js functions to add our own utility
 */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhanceMouseInput = exports.enhancePointerEventInput = void 0;
/* Hammer.js constants */
var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};
/**
 * Helper function that returns true if any element in an array meets given criteria.
 * Because older browsers do not support `Array.prototype.some`
 * @params array {Array}
 * @params predict {Function}
 */
function some(array, predict) {
    for (var i = 0; i < array.length; i++) {
        if (predict(array[i])) {
            return true;
        }
    }
    return false;
}
/* eslint-disable no-invalid-this */
function enhancePointerEventInput(PointerEventInput) {
    var oldHandler = PointerEventInput.prototype.handler;
    // overrides PointerEventInput.handler to accept right mouse button
    PointerEventInput.prototype.handler = function handler(ev) {
        var store = this.store;
        // Allow non-left mouse buttons through
        if (ev.button > 0 && ev.type === 'pointerdown') {
            if (!some(store, function (e) { return e.pointerId === ev.pointerId; })) {
                store.push(ev);
            }
        }
        oldHandler.call(this, ev);
    };
}
exports.enhancePointerEventInput = enhancePointerEventInput;
// overrides MouseInput.handler to accept right mouse button
function enhanceMouseInput(MouseInput) {
    MouseInput.prototype.handler = function handler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];
        // on start we want to have the mouse button down
        if (eventType & INPUT_START && ev.button >= 0) {
            this.pressed = true;
        }
        if (eventType & INPUT_MOVE && ev.buttons === 0) {
            eventType = INPUT_END;
        }
        // mouse must be down
        if (!this.pressed) {
            return;
        }
        if (eventType & INPUT_END) {
            this.pressed = false;
        }
        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: 'mouse',
            srcEvent: ev
        });
    };
}
exports.enhanceMouseInput = enhanceMouseInput;
//# sourceMappingURL=hammer-overrides.js.map