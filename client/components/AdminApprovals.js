import React from "react";
import { connect } from "react-redux";
import TimeAgo from "timeago-react";
import Moment from "react-moment";
import Select from "react-select";

import { createUserTwitterLink, createTweetLink } from "./Utils";

import { fetchApprovals } from "../actions/adminActions";
import { fetchStoresList } from "../actions/storeActions";

import Error from "./Error";
import Success from "./Success";
import TopNav from "./TopNav";
import PageNotFound from "./PageNotFound";
import PageNotAuthorized from "./PageNotAuthorized";

require( "../less/Admin.less" );
require( "../less/Utils.less" );
require( "../less/Spinners.less" );
require( "../../node_modules/react-select/less/select.less" );

@connect( ( store ) => {
	console.log( "store", store );
	return {
		receipts: store.admin.approvals.receipts,
		users: store.admin.approvals.users,
		approvalsError: store.admin.approvals.error,
		stores: store.storesListReducer.stores,
		storeListError: store.storesListReducer.error,
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

	updateReceipt( index ) {

		let receipt = this.state.receipts[ index ];

		let id = receipt._id;
		let data = {
			approved: receipt.approved,
			type: receipt.type,
			number: receipt.number,
		};
		if ( receipt.store )
			data.store = receipt.store;

		console.log( "updateReceipt", id, data );

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

	render() {

		let errors = [];
		const success = "";
		const { approvalsError, storeListError } = this.props;
		const { receipts, users } = this.state;

		if ( approvalsError ) errors.push( approvalsError );
		if ( storeListError ) errors.push( storeListError );

		const receipt_approvals_html = receipts.map( ( receipt, index ) => {
			
			let receipt_number = ( receipt.number ) ? receipt.number : "";
			let store_number = ( receipt.store ) ? receipt.store.number : "";
			let store_id = ( receipt.store ) ? receipt.store : "";

			return (
				<tr key={ index }>
					<td class="nowrap">
						<a href={ createUserTwitterLink( receipt.tweet.data.user.screen_name ) }>{ "@" + receipt.tweet.data.user.screen_name }</a>
					</td>
					<td>
						<a href={ createTweetLink( receipt.tweet.data.user.screen_name, receipt.tweet.data.id_str ) }>{ receipt.tweet.data.text }</a>
					</td>
					<td class="nowrap">
						<Moment date={ receipt.date } format="MMMM Do YYYY" />
						<br />
						<Moment date={ receipt.date } format="h:mm:ss a" />
					</td>
					<td>
						<div class="input">
							<input type="number" min="0" value={ receipt_number } onChange={ ( event ) => { this.changeReceiptNumber( index, event.target.value ) } } />
						</div>
					</td>
					<td>
						<div class="select">
							<Select
								tabIndex="2"
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
						<div class="button" onClick={ () => this.updateReceipt( index ) }>
							Update
						</div>
					</td>
				</tr>
			)
		});

		return	(
			<div>
				<TopNav title="Admin Approvals" />
				<Error messages={ errors } />
				<Success messages={ [ success ] } />
				<div class="container" id="admin">
					<div>
						<div class="title">Receipts</div>
						<table>
							<thead>
								<tr>
									<th>Screen Name</th>
									<th>Text</th>
									<th>Date</th>
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
				</div>
			</div>
		)
	}
}