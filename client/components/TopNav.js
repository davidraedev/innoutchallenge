import React from "react"
import { connect } from "react-redux"
import { NavLink } from "react-router-dom";

import { fetchUsers, changeSearch, clearUsers } from "../actions/usersActions"

require( "../less/TopNav.less" )

@connect( ( store ) => {
	return {
		authenticated: store.authCheck.authenticated,
		searchText: store.users.searchText,
	}
})

export default class TopNav extends React.Component {

	constructor( props ) {
		super( props );
		this.state = {
			sidebarClass: "closed",
			backButtonClass: ( this.props.showBackButton ) ? "show" : "hide",
			usersPerPage: this.props.usersPerPage || 6,
			currentPage: this.props.currentPage || 1,
			searchText: "",
		};

		this.sidebarToggle = this.sidebarToggle.bind( this );
		this.search = this.search.bind( this );
	}

	sidebarToggle() {
		let className = ( this.state.sidebarClass === "open" ) ? "closed" : "open";
		this.setState({
			sidebarClass: className
		});
	}

	search() {

		let text = document.getElementById( "searchText" ).value

		if ( ! text.length )
			return this.props.dispatch( clearUsers( this.props.dispatch ) )

		if ( this.state.searchText == text )
			return

		this.setState({
			searchText: text,
		}, () => {
			return this.props.dispatch( fetchUsers( this.props.dispatch, this.state.searchText, this.state.usersPerPage, this.state.currentPage ) )
		})
	}

	createUserTwitterLink( title ) {
		return "https://twitter.com/"+ title.substring( 1 );
	}

	render() {

		let { authenticated, searchText, title, linkTwitter } = this.props

		let authLinks
		if ( authenticated ) {
			authLinks = (
				<div>
					<li><a href="/account/settings" onClick={ this.sidebarToggle }>Account</a></li>
					<li><a href={ process.env.REACT_APP_BACKEND_URL + "/signout" } onClick={ this.sidebarToggle }>Sign Out</a></li>
				</div>
			)
		}
		else {
			authLinks = (
				<div>
					<li><a href={ process.env.REACT_APP_BACKEND_URL + "/signin" } onClick={ this.sidebarToggle }>Sign In</a></li>
				</div>
			)
		}

		let title_el
		if ( this.props.search ) {
			title_el = (
				<div class="text search">
					<input id="searchText" type="text" placeholder="Search for challenger..." defaultValue={ searchText } onChange={ this.search }/>
					<i id="search_button" class="fa fa-search search_button" onClick={ this.search }></i>
				</div>
			)
		}
		else if ( linkTwitter ) {
			title_el = (
				<div class="text">
					<a href={ this.createUserTwitterLink( title ) }>{ title }</a>
				</div>
			)
		}
		else {
			title_el = (
				<div class="text">
					{ title }
				</div>
			)
		}

		return (
			<div class="top">
				<nav id="top_nav">
					<div class="logo">
						<NavLink to="/challengers" class={ this.state.backButtonClass }><i class="fa fa-close" aria-hidden="true"></i></NavLink>
					</div>
					<ul class="dropdown">
						<li onClick={ this.sidebarToggle }>
							<i class="fa fa-bars icon" aria-hidden="true"></i>
						</li>
					</ul>
					{ title_el }
				</nav>
				<div id="side_nav_clickfield" class={ this.state.sidebarClass } onClick={ this.sidebarToggle }></div>
				<ul id="side_nav" class={ this.state.sidebarClass }>
					<li><NavLink exact to="/" activeClassName="active" onClick={ this.sidebarToggle }>Home</NavLink></li>
					<li><NavLink to="/challengers" activeClassName="active" onClick={ this.sidebarToggle }>Challengers</NavLink></li>
					<li><NavLink to="/search" activeClassName="active" onClick={ this.sidebarToggle }>Search</NavLink></li>
					{ authLinks }
				</ul>
			</div>
		)
	}
}