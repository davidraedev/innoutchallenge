import React from "react"
import { connect } from "react-redux"
import TimeAgo from "timeago-react"

import { fetchUserReceipts } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/User.less" )

@connect( ( store ) => {
	return {
		user: store.userReceipts.user,
		error: store.userReceipts.error,
	}
})

export default class UserReceipts extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchUserReceipts( this.props.dispatch, this.props.match.params.user, true ) )
	}

	formatNumber( number ) {
		if ( number == 69 )
			return "68½";
		return number;
	}

	render() {

		const { user, error } = this.props;
		let mappedReceipts = []
		
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
		if ( ! Object.keys( user.receipts ).length ) {
			user.totals.receipts.total = user.totals.receipts.total || 0
			user.totals.receipts.unique = user.totals.receipts.unique || 0
		}
		else {
			const receipt_keys = Object.keys( user.receipts ).sort( ( a, b ) => { return a - b });
			receipt_keys.forEach( ( number ) => {
				let receipt = user.receipts[ number ];
				let classes = [ "number", "receipt", "single" ];
				if ( receipt.amount > 0 )
					classes.push( "has" );
				if ( receipt.amount > 1 )
					classes.push( "multiple" );
				if ( user.latest_receipt && user.latest_receipt.number == number )
					classes.push( "latest" );
				mappedReceipts.push( ( <li className={ classes.join( " " ) } key={ number }>{ number }</li> ) )
			})
			content = (
				<div>
					<div class="latest_tweet">
						{ user.latest_receipt.tweet.data.text }<span class="date"> - <span title={ user.latest_receipt.date }><TimeAgo datetime={ user.latest_receipt.date } /></span></span>
					</div>
					<div class="section individuals">
						<ul>
							{ mappedReceipts }
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
								{ this.formatNumber( user.totals.receipts.total ) }
							</div>
						</div>
						<div class="item circle middle">
							<div class="title">
								unique
							</div>
							<div class="number">
								{ this.formatNumber( user.totals.receipts.unique ) }
							</div>
						</div>
						<div class="item circle right small">
							<div class="title">
								left
							</div>
							<div class="number">
								{ this.formatNumber( user.totals.receipts.remaining ) }
							</div>
						</div>
					</div>
					{ content }
				</div>
			</div>
		)
	}
}