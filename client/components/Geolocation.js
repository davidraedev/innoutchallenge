import React from "react";
import { geolocated, geoPropTypes } from "react-geolocated";

class Geolocation extends React.Component {

	componentDidUpdate( old_props ) {
		if ( JSON.stringify( old_props ) !== JSON.stringify( this.props ) )
			this.props.handler();
	}

	render() {
		return "";
	}
}

Geolocation.propTypes = { ...Geolocation.propTypes, ...geoPropTypes };

export default geolocated({
	positionOptions: {
		enableHighAccuracy: false,
	},
	userDecisionTimeout: 5000,
	suppressLocationOnMount: true,
	watchPosition: true,
})( Geolocation );
