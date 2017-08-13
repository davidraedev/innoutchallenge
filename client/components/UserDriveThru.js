import React from "react"
import { connect } from "react-redux"
import TimeAgo from "timeago-react"

import { fetchUserDriveThru } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/User.less" )

@connect( ( store ) => {
	return {
		user: store.userDriveThru.user,
		error: store.userDriveThru.error,
	}
})

export default class UserReceipts extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchUserDriveThru( this.props.dispatch, this.props.match.params.user, true ) )
	}

	render() {

		const { user, error } = this.props;

		let mappedDriveThru = []

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

		let content
		if ( ! Object.keys( user.drivethru ).length ) {
			user.totals.drivethru.total = user.totals.drivethru.total || 0
			user.totals.drivethru.unique = user.totals.drivethru.unique || 0
		}
		else {
			const receipt_keys = Object.keys( user.drivethru ).sort( ( a, b ) => { return a - b });
			receipt_keys.forEach( ( number ) => {
				let receipt = user.drivethru[ number ];
				let classes = [ "number", "receipt" ];
				if ( receipt.amount > 0 )
					classes.push( "has" );
				if ( receipt.amount > 1 )
					classes.push( "multiple" );
				if ( user.latest_receipt && user.latest_receipt.number == number )
					classes.push( "latest" );
				mappedDriveThru.push( ( <li className={ classes.join( " " ) } key={ number }>{ number }</li> ) )
			})
			content = (
				<div>
					<div class="latest_tweet">
						{ user.latest_receipt.tweet.data.text }<span class="date"> - <span title={ user.latest_receipt.date }><TimeAgo datetime={ user.latest_receipt.date } /></span></span>
					</div>
					<div class="section individuals">
						<ul>
							{ mappedDriveThru }
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
						<div class="item circle left">
							<div class="title">
								total
							</div>
							<div class="number">
								{ user.totals.drivethru.total }
							</div>
						</div>
						<div class="item circle middle">
							<div class="title">
								unique
							</div>
							<div class="number">
								{ user.totals.drivethru.unique }
							</div>
						</div>
					</div>
					{ content }
				</div>
			</div>
		)
	}
}