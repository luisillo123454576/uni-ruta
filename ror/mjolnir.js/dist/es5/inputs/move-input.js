"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var input_1 = require("./input");
var constants_1 = require("../constants");
var MOUSE_EVENTS = constants_1.INPUT_EVENT_TYPES.MOUSE_EVENTS;
var MOVE_EVENT_TYPE = 'pointermove';
var OVER_EVENT_TYPE = 'pointerover';
var OUT_EVENT_TYPE = 'pointerout';
var ENTER_EVENT_TYPE = 'pointerenter';
var LEAVE_EVENT_TYPE = 'pointerleave';
/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */
var MoveInput = /** @class */ (function (_super) {
    __extends(MoveInput, _super);
    function MoveInput(element, callback, options) {
        var _this = _super.call(this, element, callback, options) || this;
        _this.handleEvent = function (event) {
            _this.handleOverEvent(event);
            _this.handleOutEvent(event);
            _this.handleEnterEvent(event);
            _this.handleLeaveEvent(event);
            _this.handleMoveEvent(event);
        };
        _this.pressed = false;
        var enable = _this.options.enable;
        _this.enableMoveEvent = enable;
        _this.enableLeaveEvent = enable;
        _this.enableEnterEvent = enable;
        _this.enableOutEvent = enable;
        _this.enableOverEvent = enable;
        _this.events = (_this.options.events || []).concat(MOUSE_EVENTS);
        _this.events.forEach(function (event) { return element.addEventListener(event, _this.handleEvent); });
        return _this;
    }
    MoveInput.prototype.destroy = function () {
        var _this = this;
        this.events.forEach(function (event) { return _this.element.removeEventListener(event, _this.handleEvent); });
    };
    /**
     * Enable this input (begin processing events)
     * if the specified event type is among those handled by this input.
     */
    MoveInput.prototype.enableEventType = function (eventType, enabled) {
        if (eventType === MOVE_EVENT_TYPE) {
            this.enableMoveEvent = enabled;
        }
        if (eventType === OVER_EVENT_TYPE) {
            this.enableOverEvent = enabled;
        }
        if (eventType === OUT_EVENT_TYPE) {
            this.enableOutEvent = enabled;
        }
        if (eventType === ENTER_EVENT_TYPE) {
            this.enableEnterEvent = enabled;
        }
        if (eventType === LEAVE_EVENT_TYPE) {
            this.enableLeaveEvent = enabled;
        }
    };
    MoveInput.prototype.handleOverEvent = function (event) {
        if (this.enableOverEvent) {
            if (event.type === 'mouseover') {
                this._emit(OVER_EVENT_TYPE, event);
            }
        }
    };
    MoveInput.prototype.handleOutEvent = function (event) {
        if (this.enableOutEvent) {
            if (event.type === 'mouseout') {
                this._emit(OUT_EVENT_TYPE, event);
            }
        }
    };
    MoveInput.prototype.handleEnterEvent = function (event) {
        if (this.enableEnterEvent) {
            if (event.type === 'mouseenter') {
                this._emit(ENTER_EVENT_TYPE, event);
            }
        }
    };
    MoveInput.prototype.handleLeaveEvent = function (event) {
        if (this.enableLeaveEvent) {
            if (event.type === 'mouseleave') {
                this._emit(LEAVE_EVENT_TYPE, event);
            }
        }
    };
    MoveInput.prototype.handleMoveEvent = function (event) {
        if (this.enableMoveEvent) {
            switch (event.type) {
                case 'mousedown':
                    if (event.button >= 0) {
                        // Button is down
                        this.pressed = true;
                    }
                    break;
                case 'mousemove':
                    // Move events use `bottons` to track the button being pressed
                    if (event.buttons === 0) {
                        // Button is not down
                        this.pressed = false;
                    }
                    if (!this.pressed) {
                        // Drag events are emitted by hammer already
                        // we just need to emit the move event on hover
                        this._emit(MOVE_EVENT_TYPE, event);
                    }
                    break;
                case 'mouseup':
                    this.pressed = false;
                    break;
                default:
            }
        }
    };
    MoveInput.prototype._emit = function (type, event) {
        this.callback({
            type: type,
            center: {
                x: event.clientX,
                y: event.clientY
            },
            srcEvent: event,
            pointerType: 'mouse',
            target: event.target
        });
    };
    return MoveInput;
}(input_1.default));
exports.default = MoveInput;
//# sourceMappingURL=move-input.js.map