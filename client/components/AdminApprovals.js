import React from "react";
import { connect } from "react-redux";
import TimeAgo from "timeago-react";
import Moment from "react-moment";
import Select from "react-select";

import { createUserTwitterLink, createTweetLink, createUserTwitterSearchLink } from "./Utils";

import { fetchApprovals, updateReceipt, updateUser } from "../actions/adminActions";
import { fetchStoresList } from "../actions/storeActions";

import Error from "./Error";
import Success from "./Success";
import TopNav from "./TopNav";
import SubNav from "./SubNav";
import PageNotFound from "./PageNotFound";
import PageNotAuthorized from "./PageNotAuthorized";

require( "../less/Admin.less" );
require( "../less/Utils.less" );
require( "../less/Spinners.less" );
require( "../../node_modules/react-select/less/select.less" );

@connect( ( store ) => {
	console.log( "store", store );
	return {
		receipts: store.adminFetchApprovals.approvals.receipts,
		users: store.adminFetchApprovals.approvals.users,
		approvalsError: store.adminFetchApprovals.approvals.error,
		stores: store.storesList.stores,
		storeListError: store.storesList.error,
		receiptIsSubmitting: store.adminUpdateReceipt.saving,
		userIsSubmitting: store.adminUpdateUser.saving,
	}
})

export default class AdminReceipts extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchApprovals( this.props.dispatch ) );
		this.props.dispatch( fetchStoresList( this.props.dispatch ) );
		this.setState({
			receipts: this.props.receipts,
			users: this.props.users,
		});
	}

	updateReceiptData( index ) {

		let receipt = this.state.receipts[ index ];

		let id = receipt._id;
		let data = {
			approved: receipt.approved,
			type: receipt.type,
			number: receipt.number,
		};
		if ( receipt.store )
			data.store = receipt.store;

		this.props.dispatch( updateReceipt( this.props.dispatch, id, data ) );

	}

	updateUserData( index ) {

		let user = this.state.users[ index ];

		let id = user._id;
		let data = {
			state: user.state,
		};

		this.props.dispatch( updateUser( this.props.dispatch, id, data ) );

	}

	componentDidUpdate( old_props ) {
		if ( JSON.stringify( this.props.receipts ) !== JSON.stringify( old_props.receipts )
			|| JSON.stringify( this.props.users ) !== JSON.stringify( old_props.users )
		) {
			this.setState({
				receipts: this.props.receipts,
				users: this.props.users,
			}, () => {
				console.log( "this.state", this.state )
			});
		}
	}

	changeReceiptNumber( index, receipt_number ) {
		console.log( "changeReceiptNumber" )
		let new_state = { ...this.state };
		new_state.receipts[ index ].number = parseInt( receipt_number, 10 );
		this.setState( new_state );
	}

	changeReceiptStore( index, select_value ) {
		console.log( "changeReceiptStore" )
		let store_id = select_value.value || "";
		console.log( "store_id", store_id )
		let new_state = { ...this.state };
		new_state.receipts[ index ].store = store_id;
		this.setState( new_state );
	}

	changeReceiptType( index, value ) {
		console.log( "changeReceiptType" )
		let new_state = { ...this.state };
		new_state.receipts[ index ].type = value;
		this.setState( new_state );
	}

	changeReceiptApproval( index, value ) {
		console.log( "changeReceiptApproval" )
		let new_state = { ...this.state };
		new_state.receipts[ index ].approved = value;
		this.setState( new_state );
	}

	getStoresOptions() {

		let stores = this.props.stores;
			stores = stores.map( ( store ) => {

				return {
					value: store._id,
					label: store.number + " - " + store.location.address + " (" + store.location.city + ", " + store.location.state + ")",
				};

			});

			stores.unshift( { value: "", label: "--" } );

		return stores;
	}

	getUserStateOptions() {

		const options = [
			{ value: 0, label: "not approved" },
			{ value: 1, label: "approved" },
			{ value: 2, label: "banned" },
			{ value: 3, label: "temp_ignored" },
			{ value: 4, label: "admin" },
			{ value: 5, label: "app" },
		];

		return options;
	}

	changeUserState( index, user_state ) {
		console.log( "changeUserState", user_state )
		let new_state = { ...this.state };
		new_state.users[ index ].state = user_state.value;
		this.setState( new_state );
	}

	render() {

		let errors = [];
		const success = "";
		const { approvalsError, storeListError } = this.props;
		const { receipts, users } = this.state;

		if ( approvalsError )
			errors.push( approvalsError );
		if ( storeListError )
			errors.push( storeListError );

		const receipt_approvals_html = receipts.map( ( receipt, index ) => {
			
			let receipt_number = ( receipt.number ) ? receipt.number : "";
			let store_number = ( receipt.store ) ? receipt.store.number : "";
			let store_id = ( receipt.store ) ? receipt.store : "";

			let submitButtonClass = "button relative";
			if ( this.props.receiptIsSubmitting )
				submitButtonClass += " disabled";
			let submitSpinnerClass = "spinner_wrap";
			if ( this.props.receiptIsSubmitting )
				submitSpinnerClass += " show";

			let geo = ( receipt.tweet.data.coordinates ) ? receipt.tweet.data.coordinates.coordinates.reverse().join( "\n" ) : ( receipt.tweet.data.place ) ? receipt.tweet.data.place.full_name : "";
			let geo_url = ( receipt.tweet.data.coordinates ) ? "https://www.google.com/maps/?q=" + receipt.tweet.data.coordinates.coordinates.join( "," ) : ( receipt.tweet.data.place ) ? receipt.tweet.data.place.url : "";

			return (
				<tr key={ index }>
					<td class="nowrap">
						<a href={ createUserTwitterSearchLink( receipt.tweet.data.user.screen_name, "innoutchallenge" ) } target="_blank">{ "@" + receipt.tweet.data.user.screen_name }</a>
					</td>
					<td>
						<a href={ createTweetLink( receipt.tweet.data.user.screen_name, receipt.tweet.data.id_str ) } target="_blank">{ receipt.tweet.data.text }</a>
					</td>
					<td class="nowrap">
						<Moment date={ receipt.date } format="MMMM Do YYYY" />
						<br />
						<Moment date={ receipt.date } format="h:mm:ss a" />
					</td>
					<td>
						<a href={ geo_url } target="_blank">
							{ geo }
						</a>
					</td>
					<td>
						<div class="input">
							<input type="number" min="0" value={ receipt_number } onChange={ ( event ) => { this.changeReceiptNumber( index, event.target.value ) } } />
						</div>
					</td>
					<td>
						<div class="select">
							<Select
								value={ store_id }
								onChange={ ( select_value ) => { this.changeReceiptStore( index, select_value ) } }
								options={ this.getStoresOptions() }
							/>
						</div>
					</td>
					<td>
						<select value={ receipt.type } onChange={ ( event ) => { this.changeReceiptType( index, event.target.value ) } }>
							<option value="0">Unknown</option>
							<option value="1">In-Store</option>
							<option value="2">Drive-Thru</option>
							<option value="3">Popup</option>
							<option value="4">Test</option>
						</select>
					</td>
					<td>
						<select value={ receipt.approved } onChange={ ( event ) => { this.changeReceiptApproval( index, event.target.value ) } }>
							<option value="0">Not Yet Approved</option>
							<option value="1">Approved</option>
							<option value="2">Auto Approved</option>
							<option value="3">Admin Ignored</option>
						</select>
					</td>
					<td>
						<div class={ submitButtonClass } onClick={ () => this.updateReceiptData( index ) }>
							Update
							<div class={ submitSpinnerClass }>
								<div class="spinner spinner_a"></div>
							</div>
						</div>
					</td>
				</tr>
			)
		});

		const user_approvals_html = users.map( ( user, index ) => {

			let submitButtonClass = "button relative";
			if ( this.props.userIsSubmitting )
				submitButtonClass += " disabled";
			let submitSpinnerClass = "spinner_wrap";
			if ( this.props.userIsSubmitting )
				submitSpinnerClass += " show";

			return (
				<tr key={ index }>
					<td class="nowrap">
						<a href={ createUserTwitterLink( user.twitter_user.data.screen_name ) } target="_blank">{ "@" + user.twitter_user.data.screen_name }</a>
					</td>
					<td>
						<div class="select">
							<Select
								value={ user.state }
								onChange={ ( select_value ) => { this.changeUserState( index, select_value ) } }
								options={ this.getUserStateOptions() }
							/>
						</div>
					</td>
					<td>
						<div class={ submitButtonClass } onClick={ () => this.updateUserData( index ) }>
							Update
							<div class={ submitSpinnerClass }>
								<div class="spinner spinner_a"></div>
							</div>
						</div>
					</td>
				</tr>
			)
		});

		return	(
			<div>
				<TopNav title="Admin" />
				<SubNav url={ this.props.computedMatch.url } type="admin" />
				<Error messages={ errors } />
				<Success messages={ [ success ] } />
				<div class="container" id="admin">
					<div>
						<div class="title">Receipts</div>
						<table class="approval_table">
							<thead>
								<tr>
									<th>Screen Name</th>
									<th>Text</th>
									<th>Date</th>
									<th>Geo</th>
									<th>Receipt</th>
									<th>Store</th>
									<th>Receipt Type</th>
									<th>Approval Status</th>
									<th>Submit</th>
								</tr>
							</thead>
							<tbody>
								{ receipt_approvals_html }
							</tbody>
						</table>
					</div>
					<div>
						<div class="title">Users</div>
						<table class="approval_table">
							<thead>
								<tr>
									<th>Screen Name</th>
									<th>State</th>
									<th>Submit</th>
								</tr>
							</thead>
							<tbody>
								{ user_approvals_html }
							</tbody>
						</table>
					</div>
				</div>
			</div>
		)
	}
}