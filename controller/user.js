var User = require( "../model/user" );
var Receipt = require( "../model/receipt" );
const ObjectId = require( "mongoose" ).Types.ObjectId;

exports.users_list = function( request, response ) {

	// { search, amount, page } = request.body
	const search = request.body.search
	const amount = parseInt( request.body.amount )
	const page = parseInt( request.body.page )

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

		users.forEach( ( user, i ) => {
			Receipt.count( { user: new ObjectId( user._id ), approved: 1 }, ( error, count ) => {

				if ( error )
					return response.status( 500 ).send( error );

				user.totals = { receipts: { unique: count } };
				if ( -- users_left === 0 )
					return response.send( JSON.stringify( users ) );
			})
		})

	}).lean()
	
};

exports.user_receipts = function( request, response ) {

	const name = request.body.name

	if ( ! name )
		return response.status( 500 ).send( "Invalid name" );

	User.findOne( { state: 1, name: { $regex : new RegExp( name, "i") } }, "name", ( error, user ) => {

		if ( error )
			return response.status( 500 ).send( error );

		if ( error )
			return response.status( 404 ).send( "User Not Found" );

		Receipt.find( { user: new ObjectId( user._id ), approved: 1 }, ( error, receipts ) => {

			if ( error )
				return response.status( 500 ).send( error );

			user.totals = {
				receipts: {
					unique: 0,
					total: 0,
					remaining: 98,
				}
			};

			let receipts_list = {};
			for ( let i = 1; i <= 99; i++ ) {
				if ( i !== 69 )
					receipts_list[ i ] = { amount: 0 }
			}

			receipts.forEach( ( receipt ) => {
				if ( receipts_list[ receipt.number ].amount === 0 ) {
					user.totals.receipts.unique++;
					user.totals.receipts.remaining--;
				}
				user.totals.receipts.total++;
				receipts_list[ receipt.number ].amount++;
			})

			user.receipts = receipts_list

			console.log( "server user >> ", user )

			return response.send( JSON.stringify( user ) );

		}).sort({ "data.created_at": "asc" }).lean()

	}).lean()
};

exports.user_create_get = function( req, res ) {
	res.send( "NOT IMPLEMENTED: User Create GET" );
};

exports.user_create_post = function( req, res ) {
	res.send( "NOT IMPLEMENTED: User Create POST" );
};

exports.user_delete_get = function( req, res ) {
	res.send( "NOT IMPLEMENTED: User Delete GET" );
};

exports.user_delete_post = function( req, res ) {
	res.send( "NOT IMPLEMENTED: User Delete POST" );
};

exports.user_update_get = function( req, res ) {
	res.send( "NOT IMPLEMENTED: User Update GET" );
};

exports.user_update_post = function( req, res ) {
	res.send( "NOT IMPLEMENTED: User Update POST" );
};