import React from "react"
import { NavLink } from "react-router-dom"

require( "../less/SubNav.less" )

export default class SubNav extends React.Component {

	render() {

		let path;
		let paths = [];
		if ( this.props.type === "user" ) {
			paths = paths.concat([
				{ url: "receipts", text: "receipts" },
				{ url: "stores", text: "stores" },
				{ url: "drivethru", text: "drive-thru" },
				{ url: "map", text: "map" },
			]);
			path = this.props.url.replace( /(\/receipts|\/stores|\/drivethru|\/map)$/, "" )
		}
		else if ( this.props.type === "account" ) {
			paths = paths.concat([
				{ url: "settings", text: "settings" },
				{ url: "receipts", text: "receipts" },
			]);
			path = this.props.url.replace( /(\/receipts|\/settings)$/, "" )
		}
		else if ( this.props.type === "admin" ) {
			paths = paths.concat([
				{ url: "approvals", text: "approvals" },
				{ url: "queues", text: "queues" },
			]);
			path = this.props.url.replace( /(\/approvals|\/queues)$/, "" )
		}

		const mappedLinks = paths.map( ( link, index ) => (
			<li key={ index }>
				<NavLink to={ path + "/" + link.url } activeClassName="active">{ link.text }</NavLink>
			</li>
		))

		return	(
			<nav id="sub_nav">
				<ul>
					{ mappedLinks }
				</ul>
			</nav>
		)
	}
}