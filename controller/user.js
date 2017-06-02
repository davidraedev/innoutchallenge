var User = require( "../model/user" );
var TwitterUser = require( "../model/twitter_user" );
var Receipt = require( "../model/receipt" );

exports.user_list = function( req, res ) {
	res.render( "users", { users: [
		{
			total: 213,
			name: "stuballew",
		},
		{
			total: 1,
			name: "daraeman",
		}
	] } );
};

exports.user_info = function( req, res ) {

	TwitterUser.findOne( { "data.screen_name": req.params.username }, function( error, twitter_user ){

		console.log( req.params.username )

		if ( error )
			throw new Error( error );

		if ( twitter_user === null )
			throw new Error( "TwitterUser not found" );

		User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

			if ( error )
				throw new Error( error );

			if ( user === null )
				throw new Error( "User not found" );

			Receipt.find( { user: user._id }, function( error, receipts ){

				if ( error )
					throw new Error( error );

				if ( receipts === null || ! receipts.length )
					throw new Error( "No Receipts found" );

				var data = {
					total: 0,
					unique: 0,
					remaining: 0,
					receipts: {},
				};
				var in_store = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99] ;

				receipts.forEach( function( receipt ){
					if ( receipt.type === "in" ) {
						data.total++;
						var pos = in_store.indexOf( receipts.number );
						if ( pos !== -1 ) {
							data.unique++;
							data.remaining--;
							in_store.splice( pos, 1 );
						}
						if ( ! data.receipts[ receipt ] )
							data.receipts[ receipt ] = { count: 1 };
						else
							data.receipts[ receipt ].count++;
					}
				});

				res.render( "users", data );
			});
		});
	});
};