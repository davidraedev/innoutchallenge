import React from "react"
import { connect } from "react-redux"
import TimeAgo from "timeago-react"

import { fetchUserStores } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/User.less" )

@connect( ( store ) => {
	return {
		user: store.userStores.user,
		error: store.userStores.error,
	}
})

export default class UserStores extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchUserStores( this.props.dispatch, this.props.match.params.user, true ) )
	}

	render() {

		const { user, error } = this.props;

		let mappedStores = []

		if ( error ) {
			console.log( "error", error )
			if ( error.status === 404 ) {
				console.log( "404" )
				return (
					<PageNotFound error="Page was not found yo!" />
				)
			}
			else if ( error.status === 401 ) {
				console.log( "401" )
				return (
					<PageNotAuthorized returnUrl={ this.props.location.pathname } />
				)
			}
		}

		const store_keys = Object.keys( user.stores ).sort( ( a, b ) => { return a - b });
		let has_stores = false;
		store_keys.forEach( ( number ) => {
			let store = user.stores[ number ];
			let classes = [ "number", "store" ];
			if ( store.amount > 0 )
				classes.push( "has" );
			if ( store.amount > 1 ) {
				has_stores = true;
				classes.push( "multiple" );
			}
			if ( user.latest_receipt && user.latest_receipt.store.number == number )
				classes.push( "latest" );
			mappedStores.push( ( <li className={ classes.join( " " ) } key={ number }>{ number }</li> ) )
		})

		let content
		if ( ! has_stores ) {
			user.totals.stores.total = user.totals.stores.total || 0
			user.totals.stores.unique = user.totals.stores.unique || 0
			user.totals.stores.remaining = user.totals.stores.remaining || 0

		}
		else {
			content = (
				<div>
					<div class="latest_tweet">
						{ user.latest_receipt.tweet.data.text }<span class="date"> - <span title={ user.latest_receipt.date }><TimeAgo datetime={ user.latest_receipt.date } /></span></span>
					</div>
					<div class="section individuals">
						<ul>
							{ mappedStores }
						</ul>
					</div>
				</div>
			)
		}

		return	(
			<div>
				<Error error={ [ error ] } />
				<TopNav title={ "@" + user.name } showBackButton={ true } linkTwitter={ true } />
				<SubNav url={ this.props.match.url } type="user" />
				<div class="container" id="main_content">
					<div class="section totals">
						<div class="item circle left small">
							<div class="title">
								total
							</div>
							<div class="number">
								{ user.totals.stores.total }
							</div>
						</div>
						<div class="item circle middle">
							<div class="title">
								unique
							</div>
							<div class="number">
								{ user.totals.stores.unique }
							</div>
						</div>
						<div class="item circle right small">
							<div class="title">
								left
							</div>
							<div class="number">
								{ user.totals.stores.remaining }
							</div>
						</div>
					</div>
					{ content }
				</div>
			</div>
		)
	}
}