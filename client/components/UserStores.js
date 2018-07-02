import React from "react"
import { connect } from "react-redux"
import TimeAgo from "timeago-react"

import { fetchUserStores } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"
import StoreOverlay from "./StoreOverlay"

import { createTweetLink } from "./Utils"

require( "../less/User.less" )

@connect( ( store ) => {
	return {
		user: store.userStores.user,
		error: store.userStores.error,
		lastChallengersPage: store.users.currentPage,
		showOverlay: false,
	}
})

export default class UserStores extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchUserStores( this.props.dispatch, this.props.match.params.user, true ) )
		this.setState({
			storeOverlayNumber: null,
			overlayPosition: 0,
		})
	}

	showStoreOverlay( number ) {

		this.setState({
			storeOverlayNumber: number,
			overlayPosition: ( document.documentElement.scrollTop + 50 ),
			showOverlay: 1 + Math.random(),
		})
	}

	render() {

		const { user, error, lastChallengersPage } = this.props;

		if ( error ) {
			console.error( "error", error.status, error )
			if ( error.status === 404 ) {
				return (
					<PageNotFound error="Page was not found yo!" />
				)
			}
			else if ( error.status === 401 ) {
				return (
					<PageNotAuthorized returnUrl={ this.props.location.pathname } />
				)
			}
		}

		const store_keys = Object.keys( user.stores ).sort( ( a, b ) => { return a - b });
		let has_stores = false;
		let mappedStores = [];
		store_keys.forEach( ( number ) => {
			let store = user.stores[ number ];
			let classes = [ "number", "store" ];
			if ( store.amount > 0 ) {
				has_stores = true;
				classes.push( "has" );
			}
			if ( store.amount > 1 ) {
				classes.push( "multiple" );
			}
			if ( user.latest_receipt && user.latest_receipt.store.number == number ) {
				classes.push( "latest" );
			}
			mappedStores.push( ( <li className={ classes.join( " " ) } key={ number } onClick={ ( event ) => {
				this.showStoreOverlay( number )
			} }>{ number }</li> ) )
		});

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
						<a href={ createTweetLink( user.name, user.latest_receipt.tweet.data.id_str ) } target="_blank">
							{ user.latest_receipt.tweet.data.text }
							<span class="date"> - <span title={ user.latest_receipt.date }><TimeAgo datetime={ user.latest_receipt.date } /></span></span>
						</a>
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
				<Error messages={ [ error ] } />
				<TopNav title={ "@" + user.name } showBackButton={ true } lastChallengersPage={ lastChallengersPage || null } />
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
				<StoreOverlay number={ this.state.storeOverlayNumber } position={ this.state.overlayPosition } show={ this.state.showOverlay } />
			</div>
		)
	}
}