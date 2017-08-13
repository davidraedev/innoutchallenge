import React from "react"
import { connect } from "react-redux"

import { NavLink } from "react-router-dom"

import { clearUsers } from "../actions/usersActions"
import { convertProfileImageUrl, formatCircleNumber } from "./Utils"

import Error from "./Error"
import TopNav from "./TopNav"

require( "../less/Users.less" )

@connect( ( store ) => {
	console.log( "store", store )
	return {
		users: store.users.users,
		error: store.users.error,
		searchText: store.users.searchText,
	}
})

export default class SearchUsers extends React.Component {

	componentWillMount() {
		this.setState({
			usersPerPage: 6,
			currentPage: 1,
		})
		this.props.dispatch( clearUsers( this.props.dispatch ) )
	}

	render() {

		const { users, error } = this.props;

		let content
		if ( users && users[0] && users[0].name ) {
			content = users.map( ( user ) => {
				return (
					<NavLink className="item challenger" key={ user.name } to={ "/@" + user.name + "/receipts" }>
						<div className="number" style={ { backgroundImage: "url("+ convertProfileImageUrl( user.settings.avatar, 200 ) +")" } }>
						 	<div class="text">{ formatCircleNumber( user.totals.receipts.unique ) }</div>
						 </div>
						<div className="name">{ user.name }</div>
					</NavLink>
				)
			})
		}

		return (
			<div>
				<Error error={ [ error ] } />
				<TopNav search={ true } showBackButton={ false } userPerPage={ this.state.usersPerPage } currentPage={ this.state.currentPage } />
				<div className="container" id="main_content">
					<div className="challengers">
						{ content }
					</div>
				</div>
			</div>
		)
	}
}