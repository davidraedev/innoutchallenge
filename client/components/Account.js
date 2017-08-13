import React from "react"
import { connect } from "react-redux"

import { fetchAccount, changeSetting, deleteAccount } from "../actions/accountActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import PageNotFound from "./PageNotFound"
import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/Account.less" )

@connect( ( store ) => {
	console.log( "store", store )
	return {
		account: store.account.account,
		error: store.account.error,
	}
})

export default class Account extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchAccount( this.props.dispatch ) )

		this.changeSettingHandler = this.changeSettingHandler.bind( this )
		this.deleteAccountHandler = this.deleteAccountHandler.bind( this )
	}

	changeSettingHandler( event ) {
		let settings = []
		let setting = {}

		let option = event.target.dataset.option

		let category
		if ( option.match( /^tweet/ ) )
			category = "tweet";
		else if ( option.match( /^dm/ ) )
			category = "dm";
		else
			throw new Error( "invalid setting category" )

		option = option.replace( /^(tweet|dm)_/, "" )

		let value = ! this.props.account.settings[ category ][ option ]

		setting.category = category
		setting.option = option
		setting.value = value

		settings.push( setting )

		if ( option === "unique_numbers" || option === "milestones" ) {
			setting = {
				category: ( category === "dm" ) ? "tweet" : "dm",
				option: option,
				value: ! value,
			}
			settings.push( setting )
		}

		this.props.dispatch( changeSetting( this.props.dispatch, settings ) )
		
	}

	deleteAccountHandler() {
		this.props.dispatch( deleteAccount( this.props.dispatch ) )
	}

	render() {

		const { account, error } = this.props;

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

		console.log( "account.settings", account.settings )

		return	(
			<div>
				<Error error={ [ error ] } />
				<TopNav title="Account" showBackButton={ false } />
				<SubNav url={ this.props.match.url } type="account" />
				<div class="container" id="account_content">
					<div class="section">
						<div class="title">Tweet my:</div>
						<div class="options">
							<div class="option" data-option="tweet_unique_numbers" data-value={ account.settings.tweet.unique_numbers } onClick={ ( event ) => { this.changeSettingHandler( event ) } }>New In-Store Receipts</div>
						</div>
					</div>
					<div class="section">
						<div class="title">DM my:</div>
						<div class="options">
							<div class="option" data-option="dm_unique_numbers" data-value={ account.settings.dm.unique_numbers } onClick={ ( event ) => { this.changeSettingHandler( event ) } }>New In-Store Receipts</div>
							<div class="option" data-option="dm_stores" data-value={ account.settings.dm.stores } onClick={ ( event ) => { this.changeSettingHandler( event ) } }>New Stores</div>
							<div class="option" data-option="dm_drive_thrus" data-value={ account.settings.dm.drive_thrus } onClick={ ( event ) => { this.changeSettingHandler( event ) } }>New Drive-Thru Receipts</div>
						</div>
					</div>
					<div class="delete_account" >
						<span onClick={ ( event ) => { this.deleteAccountHandler() } }>Delete My Account</span>
					</div>
				</div>
			</div>
		)
	}
}