"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var PropTypes = _interopRequireWildcard(require("prop-types"));

var _staticMap = _interopRequireWildcard(require("./static-map"));

var _mapState = require("../utils/map-state");

var _transitionManager = _interopRequireDefault(require("../utils/transition-manager"));

var _mapContext = _interopRequireWildcard(require("./map-context"));

var _mjolnir = require("mjolnir.js");

var _mapController = _interopRequireDefault(require("../utils/map-controller"));

var _useIsomorphicLayoutEffect = _interopRequireDefault(require("../utils/use-isomorphic-layout-effect"));

var _terrain = require("../utils/terrain");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var propTypes = Object.assign({}, _staticMap["default"].propTypes, {
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxPitch: PropTypes.number,
  minPitch: PropTypes.number,
  onViewStateChange: PropTypes.func,
  onViewportChange: PropTypes.func,
  onInteractionStateChange: PropTypes.func,
  transitionDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  transitionInterpolator: PropTypes.object,
  transitionInterruption: PropTypes.number,
  transitionEasing: PropTypes.func,
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,
  scrollZoom: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  dragPan: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  dragRotate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  doubleClickZoom: PropTypes.bool,
  touchZoom: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  touchRotate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  keyboard: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  onHover: PropTypes.func,
  onClick: PropTypes.func,
  onDblClick: PropTypes.func,
  onContextMenu: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseOut: PropTypes.func,
  onWheel: PropTypes.func,
  touchAction: PropTypes.string,
  eventRecognizerOptions: PropTypes.object,
  clickRadius: PropTypes.number,
  interactiveLayerIds: PropTypes.array,
  getCursor: PropTypes.func,
  controller: PropTypes.instanceOf(_mapController["default"])
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';
};

var defaultProps = Object.assign({}, _staticMap["default"].defaultProps, _mapState.MAPBOX_LIMITS, _transitionManager["default"].defaultProps, {
  onViewStateChange: null,
  onViewportChange: null,
  onClick: null,
  onNativeClick: null,
  onHover: null,
  onContextMenu: function onContextMenu(event) {
    return event.preventDefault();
  },
  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoom: true,
  touchRotate: false,
  keyboard: true,
  touchAction: 'none',
  eventRecognizerOptions: {},
  clickRadius: 0,
  getCursor: getDefaultCursor
});

function normalizeEvent(event) {
  if (event.lngLat || !event.offsetCenter) {
    return event;
  }

  var _event$offsetCenter = event.offsetCenter,
      x = _event$offsetCenter.x,
      y = _event$offsetCenter.y;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return event;
  }

  var pos = [x, y];
  event.point = pos;

  if (this.map) {
    var location = this.map.unproject(pos);
    event.lngLat = [location.lng, location.lat];
  }

  return event;
}

function getFeatures(pos) {
  var map = this.map;

  if (!map || !pos) {
    return null;
  }

  var queryParams = {};
  var size = this.props.clickRadius;

  if (this.props.interactiveLayerIds) {
    queryParams.layers = this.props.interactiveLayerIds;
  }

  try {
    return map.queryRenderedFeatures(size ? [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]] : pos, queryParams);
  } catch (_unused) {
    return null;
  }
}

function onEvent(callbackName, event) {
  var func = this.props[callbackName];

  if (func) {
    func(normalizeEvent.call(this, event));
  }
}

function onPointerDown(event) {
  onEvent.call(this, event.pointerType === 'touch' ? 'onTouchStart' : 'onMouseDown', event);
}

function onPointerUp(event) {
  onEvent.call(this, event.pointerType === 'touch' ? 'onTouchEnd' : 'onMouseUp', event);
}

function onPointerMove(event) {
  onEvent.call(this, event.pointerType === 'touch' ? 'onTouchMove' : 'onMouseMove', event);

  if (!this.state.isDragging) {
    var _this$props = this.props,
        onHover = _this$props.onHover,
        interactiveLayerIds = _this$props.interactiveLayerIds;
    var features;
    event = normalizeEvent.call(this, event);

    if (interactiveLayerIds || onHover) {
      features = getFeatures.call(this, event.point);
    }

    var isHovering = Boolean(interactiveLayerIds && features && features.length > 0);
    var isEntering = isHovering && !this.state.isHovering;
    var isExiting = !isHovering && this.state.isHovering;

    if (onHover || isEntering) {
      event.features = features;

      if (onHover) {
        onHover(event);
      }
    }

    if (isEntering) {
      onEvent.call(this, 'onMouseEnter', event);
    }

    if (isExiting) {
      onEvent.call(this, 'onMouseLeave', event);
    }

    if (isEntering || isExiting) {
      this.setState({
        isHovering: isHovering
      });
    }
  }
}

function onPointerClick(event) {
  var _this$props2 = this.props,
      onClick = _this$props2.onClick,
      onNativeClick = _this$props2.onNativeClick,
      onDblClick = _this$props2.onDblClick,
      doubleClickZoom = _this$props2.doubleClickZoom;
  var callbacks = [];
  var isDoubleClickEnabled = onDblClick || doubleClickZoom;

  switch (event.type) {
    case 'anyclick':
      callbacks.push(onNativeClick);

      if (!isDoubleClickEnabled) {
        callbacks.push(onClick);
      }

      break;

    case 'click':
      if (isDoubleClickEnabled) {
        callbacks.push(onClick);
      }

      break;

    default:
  }

  callbacks = callbacks.filter(Boolean);

  if (callbacks.length) {
    event = normalizeEvent.call(this, event);
    event.features = getFeatures.call(this, event.point);
    callbacks.forEach(function (cb) {
      return cb(event);
    });
  }
}

function getRefHandles(staticMapRef) {
  return {
    getMap: staticMapRef.current && staticMapRef.current.getMap,
    queryRenderedFeatures: staticMapRef.current && staticMapRef.current.queryRenderedFeatures
  };
}

var InteractiveMap = (0, React.forwardRef)(function (props, ref) {
  var parentContext = (0, React.useContext)(_mapContext["default"]);
  var controller = (0, React.useMemo)(function () {
    return props.controller || new _mapController["default"]();
  }, []);
  var eventManager = (0, React.useMemo)(function () {
    return new _mjolnir.EventManager(null, {
      touchAction: props.touchAction,
      recognizerOptions: props.eventRecognizerOptions
    });
  }, []);
  var eventCanvasRef = (0, React.useRef)(null);
  var staticMapRef = (0, React.useRef)(null);

  var _thisRef = (0, React.useRef)({
    width: 0,
    height: 0,
    state: {
      isHovering: false,
      isDragging: false
    }
  });

  var thisRef = _thisRef.current;
  thisRef.props = props;
  thisRef.map = staticMapRef.current && staticMapRef.current.getMap();

  thisRef.setState = function (newState) {
    thisRef.state = _objectSpread(_objectSpread({}, thisRef.state), newState);
    eventCanvasRef.current.style.cursor = props.getCursor(thisRef.state);
  };

  var inRender = true;
  var viewportUpdateRequested;
  var stateUpdateRequested;

  var handleViewportChange = function handleViewportChange(viewState, interactionState, oldViewState) {
    if (inRender) {
      viewportUpdateRequested = [viewState, interactionState, oldViewState];
      return;
    }

    var _thisRef$props = thisRef.props,
        onViewStateChange = _thisRef$props.onViewStateChange,
        onViewportChange = _thisRef$props.onViewportChange;
    Object.defineProperty(viewState, 'position', {
      get: function get() {
        return [0, 0, (0, _terrain.getTerrainElevation)(thisRef.map, viewState)];
      }
    });

    if (onViewStateChange) {
      onViewStateChange({
        viewState: viewState,
        interactionState: interactionState,
        oldViewState: oldViewState
      });
    }

    if (onViewportChange) {
      onViewportChange(viewState, interactionState, oldViewState);
    }
  };

  (0, React.useImperativeHandle)(ref, function () {
    return getRefHandles(staticMapRef);
  }, []);
  var context = (0, React.useMemo)(function () {
    return _objectSpread(_objectSpread({}, parentContext), {}, {
      eventManager: eventManager,
      container: parentContext.container || eventCanvasRef.current
    });
  }, [parentContext, eventCanvasRef.current]);
  context.onViewportChange = handleViewportChange;
  context.viewport = parentContext.viewport || (0, _staticMap.getViewport)(thisRef);
  thisRef.viewport = context.viewport;

  var handleInteractionStateChange = function handleInteractionStateChange(interactionState) {
    var _interactionState$isD = interactionState.isDragging,
        isDragging = _interactionState$isD === void 0 ? false : _interactionState$isD;

    if (isDragging !== thisRef.state.isDragging) {
      thisRef.setState({
        isDragging: isDragging
      });
    }

    if (inRender) {
      stateUpdateRequested = interactionState;
      return;
    }

    var onInteractionStateChange = thisRef.props.onInteractionStateChange;

    if (onInteractionStateChange) {
      onInteractionStateChange(interactionState);
    }
  };

  var updateControllerOpts = function updateControllerOpts() {
    if (thisRef.width && thisRef.height) {
      controller.setOptions(_objectSpread(_objectSpread(_objectSpread({}, thisRef.props), thisRef.props.viewState), {}, {
        isInteractive: Boolean(thisRef.props.onViewStateChange || thisRef.props.onViewportChange),
        onViewportChange: handleViewportChange,
        onStateChange: handleInteractionStateChange,
        eventManager: eventManager,
        width: thisRef.width,
        height: thisRef.height
      }));
    }
  };

  var onResize = function onResize(_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    thisRef.width = width;
    thisRef.height = height;
    updateControllerOpts();
    thisRef.props.onResize({
      width: width,
      height: height
    });
  };

  (0, React.useEffect)(function () {
    eventManager.setElement(eventCanvasRef.current);
    eventManager.on({
      pointerdown: onPointerDown.bind(thisRef),
      pointermove: onPointerMove.bind(thisRef),
      pointerup: onPointerUp.bind(thisRef),
      pointerleave: onEvent.bind(thisRef, 'onMouseOut'),
      click: onPointerClick.bind(thisRef),
      anyclick: onPointerClick.bind(thisRef),
      dblclick: onEvent.bind(thisRef, 'onDblClick'),
      wheel: onEvent.bind(thisRef, 'onWheel'),
      contextmenu: onEvent.bind(thisRef, 'onContextMenu')
    });
    return function () {
      eventManager.destroy();
    };
  }, []);
  (0, _useIsomorphicLayoutEffect["default"])(function () {
    if (viewportUpdateRequested) {
      handleViewportChange.apply(void 0, (0, _toConsumableArray2["default"])(viewportUpdateRequested));
    }

    if (stateUpdateRequested) {
      handleInteractionStateChange(stateUpdateRequested);
    }
  });
  updateControllerOpts();
  var width = props.width,
      height = props.height,
      style = props.style,
      getCursor = props.getCursor;
  var eventCanvasStyle = (0, React.useMemo)(function () {
    return _objectSpread(_objectSpread({
      position: 'relative'
    }, style), {}, {
      width: width,
      height: height,
      cursor: getCursor(thisRef.state)
    });
  }, [style, width, height, getCursor, thisRef.state]);

  if (!viewportUpdateRequested || !thisRef._child) {
    thisRef._child = React.createElement(_mapContext.MapContextProvider, {
      value: context
    }, React.createElement("div", {
      key: "event-canvas",
      ref: eventCanvasRef,
      style: eventCanvasStyle
    }, React.createElement(_staticMap["default"], (0, _extends2["default"])({}, props, {
      width: "100%",
      height: "100%",
      style: null,
      onResize: onResize,
      ref: staticMapRef
    }))));
  }

  inRender = false;
  return thisRef._child;
});
InteractiveMap.supported = _staticMap["default"].supported;
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
var _default = InteractiveMap;
exports["default"] = _default;
//# sourceMappingURL=interactive-map.js.map