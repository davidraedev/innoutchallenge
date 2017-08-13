import React from "react"
import { connect } from "react-redux"

import { NavLink } from "react-router-dom"

import { fetchUsers } from "../actions/usersActions"
import { convertProfileImageUrl, formatCircleNumber } from "./Utils"

import Error from "./Error"
import TopNav from "./TopNav"

require( "../less/Users.less" )

@connect( ( store ) => {
	return {
		users: store.users.users,
		error: store.users.error,
		hasPreviousPage: store.users.hasPreviousPage,
		hasNextPage: store.users.hasNextPage,
		currentPage: store.users.currentPage,
	}
})

export default class Users extends React.Component {

	componentWillMount() {
		this.setState({
			users_per_page: 6,
			current_page: parseInt( this.props.match.params.page ) || 1,
		}, () => {
			this.props.dispatch( fetchUsers( this.props.dispatch, null, this.state.users_per_page, this.state.current_page ) )
		})
	}

	changePage( number ) {

		if ( this.state.current_page == number )
			return

		this.setState({
			current_page: number || 1,
		}, () => {
			this.props.dispatch( fetchUsers( this.props.dispatch, null, this.state.users_per_page, this.state.current_page ) )
		})
	}

	formatNumber( number ) {
		if ( number == 69 )
			return "68½";
		return number;
	}

	render() {

		const { users, error, hasPreviousPage, hasNextPage } = this.props;

		let content

		if ( ! users || ! users[0] || ! users[0].name ) {
			this.changePage( 1 )
			if ( this.props.location.pathname != "/challengers" )
				this.props.history.push( "/challengers" )
		}
		else {
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

		const max_pages = 5
		const min_page = 1
		
		let pages = []
		let start_page = Math.max( ( (this.state.current_page + 1) - (max_pages - 1) ), min_page );
		let end_page = ( start_page + max_pages );

		if ( ! hasNextPage )
			end_page--;

		for ( let page = start_page; page < end_page; page++ ) {
			pages.push((
				<NavLink to={ "/challengers/" + page } class="page" activeClassName="active" key={ page } onClick={ () => this.changePage( page ) }>{ page }</NavLink>
			))
		}

		let previousNavLink = ( hasPreviousPage ) ? <NavLink to={  "/challengers/" + ( this.state.current_page - 1 ) } class="previous" onClick={ () => this.changePage( ( this.state.current_page - 1 ) ) }></NavLink> : <NavLink to="/" class="previous disabled"></NavLink>
		let nextNavLink = ( hasNextPage ) ? <NavLink to={  "/challengers/" + ( this.state.current_page + 1 ) } class="next" onClick={ () => this.changePage( ( this.state.current_page + 1 ) ) }></NavLink> : <NavLink to="/" class="next disabled"></NavLink>

		return (
			<div>
				<Error error={ [ error ] } />
				<TopNav title="Challengers" showBackButton={ false } />
				<div className="container" id="main_content">
					<div className="challengers">
						{ content }
					</div>
					<nav id="challengers_nav" class="footer">
						{ previousNavLink }
						<div class="pages">
							{ pages }
						</div>
						{ nextNavLink }
					</nav>
				</div>
			</div>
		)
	}
}