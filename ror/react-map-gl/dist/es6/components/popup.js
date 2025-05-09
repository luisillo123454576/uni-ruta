import * as React from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import * as PropTypes from 'prop-types';
import useMapControl, { mapControlDefaultProps, mapControlPropTypes } from './use-map-control';
import { getDynamicPosition, ANCHOR_POSITION } from '../utils/dynamic-position';
import { getTerrainElevation } from '../utils/terrain';
import { crispPercentage, crispPixel } from '../utils/crisp-pixel';
const propTypes = Object.assign({}, mapControlPropTypes, {
  className: PropTypes.string,
  longitude: PropTypes.number.isRequired,
  latitude: PropTypes.number.isRequired,
  altitude: PropTypes.number,
  offsetLeft: PropTypes.number,
  offsetTop: PropTypes.number,
  tipSize: PropTypes.number,
  closeButton: PropTypes.bool,
  closeOnClick: PropTypes.bool,
  anchor: PropTypes.oneOf(Object.keys(ANCHOR_POSITION)),
  dynamicPosition: PropTypes.bool,
  sortByDepth: PropTypes.bool,
  onClose: PropTypes.func
});
const defaultProps = Object.assign({}, mapControlDefaultProps, {
  className: '',
  offsetLeft: 0,
  offsetTop: 0,
  tipSize: 10,
  anchor: 'bottom',
  dynamicPosition: true,
  sortByDepth: false,
  closeButton: true,
  closeOnClick: true,
  onClose: () => {}
});

function getPosition(props, viewport, el, [x, y]) {
  const {
    anchor,
    dynamicPosition,
    tipSize
  } = props;

  if (el) {
    return dynamicPosition ? getDynamicPosition({
      x,
      y,
      anchor,
      padding: tipSize,
      width: viewport.width,
      height: viewport.height,
      selfWidth: el.clientWidth,
      selfHeight: el.clientHeight
    }) : anchor;
  }

  return anchor;
}

function getContainerStyle(props, viewport, el, [x, y, z], positionType) {
  const {
    offsetLeft,
    offsetTop,
    sortByDepth
  } = props;
  const anchorPosition = ANCHOR_POSITION[positionType];
  const left = x + offsetLeft;
  const top = y + offsetTop;
  const xPercentage = crispPercentage(el, -anchorPosition.x * 100);
  const yPercentage = crispPercentage(el, -anchorPosition.y * 100, 'y');
  const style = {
    position: 'absolute',
    transform: "\n      translate(".concat(xPercentage, "%, ").concat(yPercentage, "%)\n      translate(").concat(crispPixel(left), "px, ").concat(crispPixel(top), "px)\n    "),
    display: undefined,
    zIndex: undefined
  };

  if (!sortByDepth) {
    return style;
  }

  if (z > 1 || z < -1 || x < 0 || x > viewport.width || y < 0 || y > viewport.height) {
    style.display = 'none';
  } else {
    style.zIndex = Math.floor((1 - z) / 2 * 100000);
  }

  return style;
}

function Popup(props) {
  const contentRef = useRef(null);
  const thisRef = useMapControl(props);
  const {
    context,
    containerRef
  } = thisRef;
  const [, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [contentRef.current]);
  useEffect(() => {
    if (context.eventManager && props.closeOnClick) {
      const clickCallback = () => thisRef.props.onClose();

      context.eventManager.on('anyclick', clickCallback);
      return () => {
        context.eventManager.off('anyclick', clickCallback);
      };
    }

    return undefined;
  }, [context.eventManager, props.closeOnClick]);
  const {
    viewport,
    map
  } = context;
  const {
    className,
    longitude,
    latitude,
    tipSize,
    closeButton,
    children
  } = props;
  let {
    altitude
  } = props;

  if (altitude === undefined) {
    altitude = getTerrainElevation(map, {
      longitude,
      latitude
    });
  }

  const position = viewport.project([longitude, latitude, altitude]);
  const positionType = getPosition(props, viewport, contentRef.current, position);
  const containerStyle = getContainerStyle(props, viewport, containerRef.current, position, positionType);
  const onClickCloseButton = useCallback(evt => {
    thisRef.props.onClose();
    const {
      eventManager
    } = thisRef.context;

    if (eventManager) {
      eventManager.once('click', e => e.stopPropagation(), evt.target);
    }
  }, []);
  return React.createElement("div", {
    className: "mapboxgl-popup mapboxgl-popup-anchor-".concat(positionType, " ").concat(className),
    style: containerStyle,
    ref: containerRef
  }, React.createElement("div", {
    key: "tip",
    className: "mapboxgl-popup-tip",
    style: {
      borderWidth: tipSize
    }
  }), React.createElement("div", {
    key: "content",
    ref: contentRef,
    className: "mapboxgl-popup-content"
  }, closeButton && React.createElement("button", {
    key: "close-button",
    className: "mapboxgl-popup-close-button",
    type: "button",
    onClick: onClickCloseButton
  }, "\xD7"), children));
}

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;
export default React.memo(Popup);
//# sourceMappingURL=popup.js.map