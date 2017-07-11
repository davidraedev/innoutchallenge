var User = require( "../model/user" );
var Receipt = require( "../model/receipt" );
var Store = require( "../model/store" );
const ObjectId = require( "mongoose" ).Types.ObjectId;

function findUser( name, response, callback ) {

	User.findOne( { state: 1, name: { $regex : new RegExp( name, "i") } }, [ "name", "totals" ], ( error, user ) => {

		if ( error )
			return response.status( 500 ).send( error );

		if ( error )
			return response.status( 404 ).send( "User Not Found" );

		callback( user );

	}).lean();

}
exports.users_list = function( request, response ) {

	// { search, amount, page } = request.body
//	const search = request.body.search;
	const amount = parseInt( request.body.amount );
	const page = parseInt( request.body.page );

	if ( ! amount )
		return response.status( 500 ).send( "Invalid amount" );
	if ( page < 0 || isNaN( page ) )
		return response.status( 500 ).send( "Invalid page" );

	User.find( { state: 1 }, "name", { skip: ( amount * page ), limit: amount }, ( error, users ) => {

		if ( error )
			return response.status( 500 ).send( error );

		if ( ! users.length )
			return response.send( JSON.stringify( [] ) );

		let users_left = users.length;

		users.forEach( ( user ) => {
			Receipt.count( { user: new ObjectId( user._id ), approved: 1 }, ( error, count ) => {

				if ( error )
					return response.status( 500 ).send( error );

				user.totals = { receipts: { unique: count } };
				if ( -- users_left === 0 )
					return response.send( JSON.stringify( users ) );
			});
		});

	}).sort({ in_store_unique: "desc" }).lean();

};

exports.user_instore_receipts = function( request, response ) {

	const name = request.body.name;

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	findUser( name, response, ( user ) => {

		Receipt.find( { user: new ObjectId( user._id ), type: 1, approved: 1 }, ( error, receipts ) => {

			if ( error )
				return response.status( 500 ).send( error );

			let receipts_list = {};
			for ( let i = 1; i <= 99; i++ ) {
				if ( i !== 69 )
					receipts_list[ i ] = { amount: 0 };
			}

			receipts.forEach( ( receipt ) => {
				receipts_list[ receipt.number ].amount++;
			});

			user.receipts = receipts_list;

			return response.send( JSON.stringify( user ) );

		}).sort({ "data.created_at": "asc" }).lean();

	});
};

exports.user_stores = function( request, response ) {

	const name = request.body.name;

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	findUser( name, response, ( user ) => {

		Store.find({}, ( error, stores ) => {

			if ( error )
				return response.status( 500 ).send( error );

			Receipt.find( { user: new ObjectId( user._id ), approved: 1, store: { $ne: null }, type: { $in: [ 1, 2, 3 ] } }, ( error, receipts ) => {

				if ( error )
					return response.status( 500 ).send( error );

				let stores_list = {};
				stores.forEach( ( store ) => {
					if ( ! store.popup && store.number )
						stores_list[ store.number ] = { amount: 0 };
				});

				function getStore( id ) {
					let store = null;
					Object.keys( stores ).some( ( key ) => {
						if ( stores[ key ]._id === id ) {
							store = stores[ key ];
							return true;
						}
					});
					console.log( "Store >> ", store )
					return store;
				}

				receipts.map( ( receipt ) => {
					if ( receipt.store )
						receipt.store = getStore( receipt.store );
				});

				receipts.forEach( ( receipt ) => {
					if ( ! receipt.store )
						return;
					stores_list[ receipt.number ].amount++;
				});

				user.stores = stores_list;

				return response.send( JSON.stringify( user ) );

			}).sort({ "data.created_at": "asc" }).lean();

		}).lean();

	});
};

exports.user_drivethru_receipts = function( request, response ) {

	const name = request.body.name;

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	findUser( name, response, ( user ) => {

		Receipt.find( { user: new ObjectId( user._id ), type: 3, approved: 1 }, [ "number" ], ( error, receipts ) => {

			if ( error )
				return response.status( 500 ).send( error );

			user.drivethru = receipts;

			return response.send( JSON.stringify( user ) );

		}).lean();

	});
};