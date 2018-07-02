import React from "react"

require( "../less/MapUserMarker.less" )

export default class MapUserMarker extends React.Component {

	componentWillMount() {
		
	}

	render() {

		const { number, visited } = this.props;

		let className = "map_user_marker";

		return (
			<div class={ className }>
				{ number }
			</div>
		)
	}
}