import _extends from "@babel/runtime/helpers/esm/extends";
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
const propTypes = Object.assign({}, StaticMap.propTypes, {
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

const getDefaultCursor = ({
  isDragging,
  isHovering
}) => isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';

const defaultProps = Object.assign({}, StaticMap.defaultProps, MAPBOX_LIMITS, TransitionManager.defaultProps, {
  onViewStateChange: null,
  onViewportChange: null,
  onClick: null,
  onNativeClick: null,
  onHover: null,
  onContextMenu: event => event.preventDefault(),
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

  const {
    offsetCenter: {
      x,
      y
    }
  } = event;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return event;
  }

  const pos = [x, y];
  event.point = pos;

  if (this.map) {
    const location = this.map.unproject(pos);
    event.lngLat = [location.lng, location.lat];
  }

  return event;
}

function getFeatures(pos) {
  const {
    map
  } = this;

  if (!map || !pos) {
    return null;
  }

  const queryParams = {};
  const size = this.props.clickRadius;

  if (this.props.interactiveLayerIds) {
    queryParams.layers = this.props.interactiveLayerIds;
  }

  try {
    return map.queryRenderedFeatures(size ? [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]] : pos, queryParams);
  } catch {
    return null;
  }
}

function onEvent(callbackName, event) {
  const func = this.props[callbackName];

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
    const {
      onHover,
      interactiveLayerIds
    } = this.props;
    let features;
    event = normalizeEvent.call(this, event);

    if (interactiveLayerIds || onHover) {
      features = getFeatures.call(this, event.point);
    }

    const isHovering = Boolean(interactiveLayerIds && features && features.length > 0);
    const isEntering = isHovering && !this.state.isHovering;
    const isExiting = !isHovering && this.state.isHovering;

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
        isHovering
      });
    }
  }
}

function onPointerClick(event) {
  const {
    onClick,
    onNativeClick,
    onDblClick,
    doubleClickZoom
  } = this.props;
  let callbacks = [];
  const isDoubleClickEnabled = onDblClick || doubleClickZoom;

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
    callbacks.forEach(cb => cb(event));
  }
}

function getRefHandles(staticMapRef) {
  return {
    getMap: staticMapRef.current && staticMapRef.current.getMap,
    queryRenderedFeatures: staticMapRef.current && staticMapRef.current.queryRenderedFeatures
  };
}

const InteractiveMap = forwardRef((props, ref) => {
  const parentContext = useContext(MapContext);
  const controller = useMemo(() => props.controller || new MapController(), []);
  const eventManager = useMemo(() => new EventManager(null, {
    touchAction: props.touchAction,
    recognizerOptions: props.eventRecognizerOptions
  }), []);
  const eventCanvasRef = useRef(null);
  const staticMapRef = useRef(null);

  const _thisRef = useRef({
    width: 0,
    height: 0,
    state: {
      isHovering: false,
      isDragging: false
    }
  });

  const thisRef = _thisRef.current;
  thisRef.props = props;
  thisRef.map = staticMapRef.current && staticMapRef.current.getMap();

  thisRef.setState = newState => {
    thisRef.state = { ...thisRef.state,
      ...newState
    };
    eventCanvasRef.current.style.cursor = props.getCursor(thisRef.state);
  };

  let inRender = true;
  let viewportUpdateRequested;
  let stateUpdateRequested;

  const handleViewportChange = (viewState, interactionState, oldViewState) => {
    if (inRender) {
      viewportUpdateRequested = [viewState, interactionState, oldViewState];
      return;
    }

    const {
      onViewStateChange,
      onViewportChange
    } = thisRef.props;
    Object.defineProperty(viewState, 'position', {
      get: () => [0, 0, getTerrainElevation(thisRef.map, viewState)]
    });

    if (onViewStateChange) {
      onViewStateChange({
        viewState,
        interactionState,
        oldViewState
      });
    }

    if (onViewportChange) {
      onViewportChange(viewState, interactionState, oldViewState);
    }
  };

  useImperativeHandle(ref, () => getRefHandles(staticMapRef), []);
  const context = useMemo(() => ({ ...parentContext,
    eventManager,
    container: parentContext.container || eventCanvasRef.current
  }), [parentContext, eventCanvasRef.current]);
  context.onViewportChange = handleViewportChange;
  context.viewport = parentContext.viewport || getViewport(thisRef);
  thisRef.viewport = context.viewport;

  const handleInteractionStateChange = interactionState => {
    const {
      isDragging = false
    } = interactionState;

    if (isDragging !== thisRef.state.isDragging) {
      thisRef.setState({
        isDragging
      });
    }

    if (inRender) {
      stateUpdateRequested = interactionState;
      return;
    }

    const {
      onInteractionStateChange
    } = thisRef.props;

    if (onInteractionStateChange) {
      onInteractionStateChange(interactionState);
    }
  };

  const updateControllerOpts = () => {
    if (thisRef.width && thisRef.height) {
      controller.setOptions({ ...thisRef.props,
        ...thisRef.props.viewState,
        isInteractive: Boolean(thisRef.props.onViewStateChange || thisRef.props.onViewportChange),
        onViewportChange: handleViewportChange,
        onStateChange: handleInteractionStateChange,
        eventManager,
        width: thisRef.width,
        height: thisRef.height
      });
    }
  };

  const onResize = ({
    width,
    height
  }) => {
    thisRef.width = width;
    thisRef.height = height;
    updateControllerOpts();
    thisRef.props.onResize({
      width,
      height
    });
  };

  useEffect(() => {
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
    return () => {
      eventManager.destroy();
    };
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (viewportUpdateRequested) {
      handleViewportChange(...viewportUpdateRequested);
    }

    if (stateUpdateRequested) {
      handleInteractionStateChange(stateUpdateRequested);
    }
  });
  updateControllerOpts();
  const {
    width,
    height,
    style,
    getCursor
  } = props;
  const eventCanvasStyle = useMemo(() => ({
    position: 'relative',
    ...style,
    width,
    height,
    cursor: getCursor(thisRef.state)
  }), [style, width, height, getCursor, thisRef.state]);

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