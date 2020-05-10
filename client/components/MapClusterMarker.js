import React from "react"

require( "../less/MapClusterMarker.less" )

export default class MapClusterMarker extends React.Component {

	componentWillMount() {
		
	}

	render() {

		const { amount, visited } = this.props;

		let className = "map_cluster_marker"
			className += ( visited ) ? " visited" : "";

		return (
			<div class={ className }>
				{ amount }
			</div>
		)
	}
}