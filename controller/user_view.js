const User = require( "../model/user" );
const Receipt = require( "../model/receipt" );
const Store = require( "../model/store" );
const userController = require( "./user" );

exports.users_list = function( request, response ) {

	const amount = parseInt( request.body.amount );
	const page = parseInt( request.body.page );
	const search = request.body.search || "";

	if ( ! amount )
		return response.status( 500 ).send( "Invalid amount" );
	if ( page < 0 || isNaN( page ) )
		return response.status( 500 ).send( "Invalid page" );

	const skip = ( ( page - 1 ) * amount );
	const limit = ( amount + 1 );

	let query = { state: 1, "totals.receipts.unique": { $ne: 0 } };
	if ( search.length )
		query.name = new RegExp( "^" + search, "i" );

	User.find( query, [ "name", "totals" ], { skip: skip, limit: limit } ).sort({ "totals.receipts.unique": "desc" }).lean()
		.then( ( users ) => {

			if ( ! users.length )
				return response.send( JSON.stringify( [] ) );
	     
			const has_next_page = ( users.length === limit );

			if ( users.length > amount )
				users.splice( [ users.length - 1 ], 1 );

			const data = {
				users: users,
				currentPage: page,
				hasNextPage: has_next_page,
				hasPreviousPage: ( page > 1 ),
				searchText: search,
			};

			return response.send( JSON.stringify( data ) );

		})
		.catch( ( error ) => {
			return response.status( 500 ).send( error );
		});

};

function getUserLatestReceipt( search_params, keys ) {
	if ( keys )
		return Receipt.findOne( search_params, keys ).populate( "tweet store" ).sort( { date: "desc" } ).limit( 1 ).lean().exec();
	else
		return Receipt.findOne( search_params ).populate( "tweet store" ).sort( { date: "desc" } ).limit( 1 ).lean().exec();
}

exports.user_instore_receipts = function( request, response ) {

	const name = request.body.name;
	const return_latest_receipt = request.body.return_latest_receipt;

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	let search_params = { type: 1, approved: { $in: [ 1, 2 ] } };

	let this_user;
	userController.searchUser( name )
		.catch( ( error ) => {
			return response.status( 404 ).send( error );
		})
		.then( ( user ) => {
			search_params.user = user._id;
			this_user = user;
			return Receipt.find( search_params ).sort( { date: "desc" } ).lean();
		})
		.then( ( receipts ) => {

			let receipts_list = {};
			for ( let i = 1; i <= 99; i++ ) {
				if ( i !== 69 )
					receipts_list[ i ] = { amount: 0 };
			}

			receipts.forEach( ( receipt ) => {
				receipts_list[ receipt.number ].amount++;
			});

			this_user.receipts = receipts_list;

			if ( return_latest_receipt )
				return getUserLatestReceipt( search_params );
			else
				return;

		})
		.then( ( latest_receipt ) => {
			if ( latest_receipt )
				this_user.latest_receipt = latest_receipt;
			return response.send( JSON.stringify( this_user ) );
		})
		.catch( ( error ) => {
			return response.status( 500 ).send( error );
		});
};

exports.user_stores = function( request, response ) {

	const name = request.body.name;
	const return_latest_receipt = request.body.return_latest_receipt;

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	let search_params = {
		approved: 1,
		store: { $ne: null },
		type: { $in: [ 1, 2, 3 ] }
	};

	let this_user;
	let this_stores;
	let stores_list = {};
	userController.searchUser( name )
		.catch( ( error ) => {
			return response.status( 404 ).send( error );
		})
		.then( ( user ) => {
			search_params.user = user._id;
			this_user = user;
			return Store.find({ popup: { $exists: false } }).lean();
		})
		.catch( ( error ) => {
			throw error;
		})
		.then( ( stores ) => {

			if ( ! stores.length ) {
				console.log( "No Stores found" );
				return response.send( JSON.stringify( this_user ) );
			}

			this_stores = stores;
			stores.forEach( ( store ) => {
				stores_list[ store._id ] = { amount: 0 };
			});

			return Receipt.find( search_params ).lean();
		})
		.then( ( receipts ) => {

			function getStore( id ) {
				let store = false;
				this_stores.some( ( temp_store ) => {
					if ( temp_store._id == id ) {
						store = temp_store;
						return true;
					}
				});
				return store;
			}

			receipts.forEach( ( receipt ) => {
				stores_list[ receipt.store ].amount++;
			});

			let final_stores = {};

			let keys = Object.keys( stores_list );
			keys.forEach( ( key ) => {
				let number = getStore( key ).number;
				final_stores[ number ] = stores_list[ key ];
			});
			this_user.stores = final_stores;

			if ( return_latest_receipt )
				return getUserLatestReceipt( search_params );
			else
				return;

		})
		.then( ( latest_receipt ) => {
			if ( latest_receipt )
				this_user.latest_receipt = latest_receipt;
			return response.send( JSON.stringify( this_user ) );
		})
		.catch( ( error ) => {
			return response.status( 500 ).send( error );
		});
};

exports.user_drivethru_receipts = function( request, response ) {

	const name = request.body.name;
	const return_latest_receipt = request.body.return_latest_receipt;

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	let search_params = { type: 3, approved: 1 };

	let this_user;
	userController.searchUser( name )
		.catch( ( error ) => {
			return response.status( 404 ).send( error );
		})
		.then( ( user ) => {
			search_params.user = user._id;
			this_user = user;
			return Receipt.find( search_params, [ "number" ] ).lean();
		})
		.then( ( receipts ) => {

			if ( ! receipts )
				receipts = [];

			this_user.drivethru = receipts;

			if ( return_latest_receipt )
				return getUserLatestReceipt( search_params );
			else
				return;

		})
		.then( ( latest_receipt ) => {
			if ( latest_receipt )
				this_user.latest_receipt = latest_receipt;
			return response.send( JSON.stringify( this_user ) );
		})
		.catch( ( error ) => {
			return response.status( 500 ).send( error );
		});

};