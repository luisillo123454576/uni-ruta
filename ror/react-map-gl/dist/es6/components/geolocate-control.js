import * as React from 'react';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { document } from '../utils/globals';
import mapboxgl from '../utils/mapboxgl';
import MapState from '../utils/map-state';
import { LINEAR_TRANSITION_PROPS } from '../utils/map-controller';
import { isGeolocationSupported } from '../utils/geolocate-utils';
import useMapControl, { mapControlDefaultProps, mapControlPropTypes } from './use-map-control';

const noop = () => {};

const propTypes = Object.assign({}, mapControlPropTypes, {
  className: PropTypes.string,
  style: PropTypes.object,
  label: PropTypes.string,
  disabledLabel: PropTypes.string,
  auto: PropTypes.bool,
  positionOptions: PropTypes.object,
  fitBoundsOptions: PropTypes.object,
  trackUserLocation: PropTypes.bool,
  showUserLocation: PropTypes.bool,
  showAccuracyCircle: PropTypes.bool,
  showUserHeading: PropTypes.bool,
  onViewStateChange: PropTypes.func,
  onViewportChange: PropTypes.func,
  onGeolocate: PropTypes.func
});
const defaultProps = Object.assign({}, mapControlDefaultProps, {
  className: '',
  label: 'Find My Location',
  disabledLabel: 'Location Not Available',
  auto: false,
  positionOptions: {
    enableHighAccuracy: false,
    timeout: 6000
  },
  fitBoundsOptions: {
    maxZoom: 15
  },
  trackUserLocation: false,
  showUserLocation: true,
  showUserHeading: false,
  showAccuracyCircle: true,
  onGeolocate: () => {}
});

function getBounds(position) {
  const center = new mapboxgl.LngLat(position.coords.longitude, position.coords.latitude);
  const radius = position.coords.accuracy;
  const bounds = center.toBounds(radius);
  return [[bounds._ne.lng, bounds._ne.lat], [bounds._sw.lng, bounds._sw.lat]];
}

function setupMapboxGeolocateControl(context, props, geolocateButton) {
  const control = new mapboxgl.GeolocateControl(props);
  control._container = document.createElement('div');
  control._map = {
    on: () => {},
    _getUIString: () => ''
  };

  control._setupUI(true);

  control._map = context.map;
  control._geolocateButton = geolocateButton;
  const {
    eventManager
  } = context;

  if (control.options.trackUserLocation && eventManager) {
    eventManager.on('panstart', () => {
      if (control._watchState === 'ACTIVE_LOCK') {
        control._watchState = 'BACKGROUND';
        geolocateButton.classList.add('mapboxgl-ctrl-geolocate-background');
        geolocateButton.classList.remove('mapboxgl-ctrl-geolocate-active');
      }
    });
  }

  control.on('geolocate', props.onGeolocate);
  return control;
}

function updateCamera(position, {
  context,
  props
}) {
  const bounds = getBounds(position);
  const {
    longitude,
    latitude,
    zoom
  } = context.viewport.fitBounds(bounds, props.fitBoundsOptions);
  const newViewState = Object.assign({}, context.viewport, {
    longitude,
    latitude,
    zoom
  });
  const mapState = new MapState(newViewState);
  const viewState = Object.assign({}, mapState.getViewportProps(), LINEAR_TRANSITION_PROPS);
  const onViewportChange = props.onViewportChange || context.onViewportChange || noop;
  const onViewStateChange = props.onViewStateChange || context.onViewStateChange || noop;
  onViewStateChange({
    viewState
  });
  onViewportChange(viewState);
}

function GeolocateControl(props) {
  const thisRef = useMapControl(props);
  const {
    context,
    containerRef
  } = thisRef;
  const geolocateButtonRef = useRef(null);
  const [mapboxGeolocateControl, createMapboxGeolocateControl] = useState(null);
  const [supportsGeolocation, setSupportsGeolocation] = useState(false);
  useEffect(() => {
    let control;

    if (context.map) {
      isGeolocationSupported().then(result => {
        setSupportsGeolocation(result);

        if (geolocateButtonRef.current) {
          control = setupMapboxGeolocateControl(context, props, geolocateButtonRef.current);

          control._updateCamera = position => updateCamera(position, thisRef);

          createMapboxGeolocateControl(control);
        }
      });
    }

    return () => {
      if (control) {
        control._clearWatch();
      }
    };
  }, [context.map]);
  const triggerGeolocate = useCallback(() => {
    if (mapboxGeolocateControl) {
      mapboxGeolocateControl.options = thisRef.props;
      mapboxGeolocateControl.trigger();
    }
  }, [mapboxGeolocateControl]);
  useEffect(() => {
    if (props.auto) {
      triggerGeolocate();
    }
  }, [mapboxGeolocateControl, props.auto]);
  useEffect(() => {
    if (mapboxGeolocateControl) {
      mapboxGeolocateControl._onZoom();
    }
  }, [context.viewport.zoom]);
  const {
    className,
    label,
    disabledLabel,
    trackUserLocation
  } = props;
  const style = useMemo(() => ({
    position: 'absolute',
    ...props.style
  }), [props.style]);
  return React.createElement("div", {
    style: style,
    className: className
  }, React.createElement("div", {
    key: "geolocate-control",
    className: "mapboxgl-ctrl mapboxgl-ctrl-group",
    ref: containerRef
  }, React.createElement("button", {
    key: "geolocate",
    className: "mapboxgl-ctrl-icon mapboxgl-ctrl-geolocate",
    ref: geolocateButtonRef,
    disabled: !supportsGeolocation,
    "aria-pressed": !trackUserLocation,
    type: "button",
    title: supportsGeolocation ? label : disabledLabel,
    "aria-label": supportsGeolocation ? label : disabledLabel,
    onClick: triggerGeolocate
  }, React.createElement("span", {
    className: "mapboxgl-ctrl-icon",
    "aria-hidden": "true"
  }))));
}

GeolocateControl.propTypes = propTypes;
GeolocateControl.defaultProps = defaultProps;
export default React.memo(GeolocateControl);
//# sourceMappingURL=geolocate-control.js.map