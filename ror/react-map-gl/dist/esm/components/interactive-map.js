import _extends from "@babel/runtime/helpers/esm/extends";
import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import * as React from 'react';
import { useContext, useRef, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as PropTypes from 'prop-types';
import StaticMap, { getViewport } from './static-map';
import { MAPBOX_LIMITS } from '../utils/map-state';
import TransitionManager from '../utils/transition-manager';
import MapContext, { MapContextProvider } from './map-context';
import { EventManager } from 'mjolnir.js';
import MapController from '../utils/map-controller';
import useIsomorphicLayoutEffect from '../utils/use-isomorphic-layout-effect';
import { getTerrainElevation } from '../utils/terrain';
var propTypes = Object.assign({}, StaticMap.propTypes, {
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
  controller: PropTypes.instanceOf(MapController)
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';
};

var defaultProps = Object.assign({}, StaticMap.defaultProps, MAPBOX_LIMITS, TransitionManager.defaultProps, {
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

var InteractiveMap = forwardRef(function (props, ref) {
  var parentContext = useContext(MapContext);
  var controller = useMemo(function () {
    return props.controller || new MapController();
  }, []);
  var eventManager = useMemo(function () {
    return new EventManager(null, {
      touchAction: props.touchAction,
      recognizerOptions: props.eventRecognizerOptions
    });
  }, []);
  var eventCanvasRef = useRef(null);
  var staticMapRef = useRef(null);

  var _thisRef = useRef({
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
        return [0, 0, getTerrainElevation(thisRef.map, viewState)];
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

  useImperativeHandle(ref, function () {
    return getRefHandles(staticMapRef);
  }, []);
  var context = useMemo(function () {
    return _objectSpread(_objectSpread({}, parentContext), {}, {
      eventManager: eventManager,
      container: parentContext.container || eventCanvasRef.current
    });
  }, [parentContext, eventCanvasRef.current]);
  context.onViewportChange = handleViewportChange;
  context.viewport = parentContext.viewport || getViewport(thisRef);
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

  useEffect(function () {
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
  useIsomorphicLayoutEffect(function () {
    if (viewportUpdateRequested) {
      handleViewportChange.apply(void 0, _toConsumableArray(viewportUpdateRequested));
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
  var eventCanvasStyle = useMemo(function () {
    return _objectSpread(_objectSpread({
      position: 'relative'
    }, style), {}, {
      width: width,
      height: height,
      cursor: getCursor(thisRef.state)
    });
  }, [style, width, height, getCursor, thisRef.state]);

  if (!viewportUpdateRequested || !thisRef._child) {
    thisRef._child = React.createElement(MapContextProvider, {
      value: context
    }, React.createElement("div", {
      key: "event-canvas",
      ref: eventCanvasRef,
      style: eventCanvasStyle
    }, React.createElement(StaticMap, _extends({}, props, {
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
InteractiveMap.supported = StaticMap.supported;
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
export default InteractiveMap;
//# sourceMappingURL=interactive-map.js.map