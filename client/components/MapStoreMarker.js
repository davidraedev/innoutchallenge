import React from "react"

require( "../less/MapStoreMarker.less" )

export default class MapStoreMarker extends React.Component {

	componentWillMount() {
		
	}

	render() {

		const { number, visited } = this.props;

		let className = "map_store_marker"
			className += ( visited ) ? " visited" : "";

		return (
			<div class={ className }>
				{ number }
			</div>
		)
	}
}