import * as React from 'react';
import { useMemo } from 'react';
import * as PropTypes from 'prop-types';
import useDraggableControl, { draggableControlDefaultProps, draggableControlPropTypes } from './draggable-control';
import { crispPixel } from '../utils/crisp-pixel';
import { getTerrainElevation } from '../utils/terrain';
const propTypes = Object.assign({}, draggableControlPropTypes, {
  className: PropTypes.string,
  longitude: PropTypes.number.isRequired,
  latitude: PropTypes.number.isRequired,
  style: PropTypes.object
});
const defaultProps = Object.assign({}, draggableControlDefaultProps, {
  className: ''
});

function getPosition({
  props,
  state,
  context
}) {
  const {
    longitude,
    latitude,
    offsetLeft,
    offsetTop
  } = props;
  const {
    dragPos,
    dragOffset
  } = state;
  const {
    viewport,
    map
  } = context;

  if (dragPos && dragOffset) {
    return [dragPos[0] + dragOffset[0], dragPos[1] + dragOffset[1]];
  }

  const altitude = getTerrainElevation(map, {
    longitude,
    latitude
  });
  let [x, y] = viewport.project([longitude, latitude, altitude]);
  x += offsetLeft;
  y += offsetTop;
  return [x, y];
}

function Marker(props) {
  const thisRef = useDraggableControl(props);
  const {
    state,
    containerRef
  } = thisRef;
  const {
    children,
    className,
    draggable,
    style
  } = props;
  const {
    dragPos
  } = state;
  const [x, y] = getPosition(thisRef);
  const transform = "translate(".concat(crispPixel(x), "px, ").concat(crispPixel(y), "px)");
  const cursor = draggable ? dragPos ? 'grabbing' : 'grab' : 'auto';
  const control = useMemo(() => {
    const containerStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      transform,
      cursor,
      ...style
    };
    return React.createElement("div", {
      className: "mapboxgl-marker ".concat(className),
      ref: thisRef.containerRef,
      style: containerStyle
    }, children);
  }, [children, className]);
  const container = containerRef.current;

  if (container) {
    container.style.transform = transform;
    container.style.cursor = cursor;
  }

  return control;
}

Marker.defaultProps = defaultProps;
Marker.propTypes = propTypes;
export default React.memo(Marker);
//# sourceMappingURL=marker.js.map