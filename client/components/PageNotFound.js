import React from "react"
import { connect } from "react-redux"

import TopNav from "./TopNav"

require( "../less/PageNotFound.less" )

export default class PageNotFound extends React.Component {

	render() {

		let error = this.props.error || "Sorry, that page was not found."

		return	(
			<div>
				<TopNav title="Page Not Found" />
				<div class="container" id="main_content">
					{ error }
				</div>
			</div>
		)
	}
}