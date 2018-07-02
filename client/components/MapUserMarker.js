import React from "react"

require( "../less/MapUserMarker.less" )

export default class MapUserMarker extends React.Component {

	componentWillMount() {
		
	}

	render() {

		return (
			<img src="/img/map_user_marker.png" class="map_user_marker" />
		)
	}
}