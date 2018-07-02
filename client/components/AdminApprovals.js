import React from "react"
import { connect } from "react-redux"
import TimeAgo from "timeago-react"

import { createUserTwitterLink } from "./Utils"

import { fetchApprovals } from "../actions/adminActions"

import Error from "./Error"
import TopNav from "./TopNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/Admin.less" )

@connect( ( store ) => {
	console.log( "store", store );
	return {
		receipts: store.admin.receipts,
		users: store.admin.users,
		error: store.admin.error,
	}
})

export default class AdminReceipts extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchApprovals( this.props.dispatch ) )
	}

	render() {

		console.log( "this.props", this.props );
/*
		const { receipts, users, error } = this.props;

		let mappedTweets = []

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
		if ( receipts.length ) {

			receipts.forEach( ( receipt ) => {
				
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
*/

		const error = "";

		return	(
			<div>
				<Error messages={ [ error ] } />
				<TopNav title="Admin Approvals" />
				<div class="container" id="main_content">
					<div>
						<div class="title">Receipts</div>
						<div class="table tweets">
							<div class="row tweet header">
								<div class="cell">
									Screen Name
								</div>
								<div class="cell">
									Text
								</div>
								<div class="cell">
									Receipt Number
								</div>
								<div class="cell">
									Store Number
								</div>
								<div class="cell">
									Receipt Type
								</div>
								<div class="cell">
									Approval Status
								</div>
								<div class="cell">
									Submit
								</div>
							</div>
							<div class="row tweet header">
								<div class="cell">
									<a href={ createUserTwitterLink( "@daraeman" ) }>@daraeman</a>
								</div>
								<div class="cell">
									dsjf sdklfjajobgxeg ekgnz .ebnz.eg xiubvonr gvl/erknj. klrh.kb!!!!!!!!!!!!!!!
								</div>
								<div class="cell">
									<div class="input">
										<input type="number" />
									</div>
								</div>
								<div class="cell">
									<div class="input">
										<input type="number" />
									</div>
								</div>
								<div class="cell">
									<select>
										<option value="0">Unknown</option>
										<option value="1">In-Store</option>
										<option value="2">Drive-Thru</option>
										<option value="3">Popup</option>
										<option value="4">Test</option>
									</select>
								</div>
								<div class="cell">
									<select>
										<option value="0">Noy Yet Approved</option>
										<option value="1">Approved</option>
										<option value="2">Auto Approved</option>
										<option value="3">Admin Ignored</option>
									</select>
								</div>
								<div class="cell">
									<div class="button">
										Submit
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}