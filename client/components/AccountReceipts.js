import React from "react"
import { connect } from "react-redux"

import { fetchUserAccount } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/Account.less" )

@connect( ( store ) => {
	return {
		account: store.account.account,
		error: store.account.error,
	}
})

export default class Account extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchUserAccount( this.props.dispatch ) )
	}

	render() {

		const { account, error } = this.props;

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

		return	(
			<div>
				<Error error={ [ error ] } />
				<TopNav title="account" showBackButton={ false } />
				<SubNav url={ this.props.match.url } type="account" />
				<div class="container" id="main_content">
					
				</div>
			</div>
		)
	}
}