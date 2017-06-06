var User = require( "../model/user" );
var TwitterUser = require( "../model/twitter_user" );
var Receipt = require( "../model/receipt" );

exports.user_list = function( req, res ) {

	function send_response( data ) {
		res.render( "users", { users: data } );
	}

	User.find( {}, ( error, users ) => {
		if ( error )
			throw error;

		if ( ! users )
			throw new Error( "No Users Found" );

		var data = [];
		var remaining = users.length;
		users.forEach( ( user ) => {
			console.log( "user > >" )
			console.log( user )
			TwitterUser.findById( user.twitter_user, ( error, twitter_user ) => {
				if ( error )
					throw error;

				if ( ! twitter_user )
					throw new Error( "No TwitterUser Found ["+ user.twitter_user +"]" );

				Receipt.find( { user: user._id }, ( error, receipts ) => {
					if ( error )
						throw error;

					if ( ! receipts )
						throw new Error( "No Receipts Found ["+ user._id +"]" );

					let total = 0;
					receipts.forEach( ( receipt ) => {
						total++;
					});
					console.log( twitter_user );
					data.push( { name: [ twitter_user.data.screen_name ], total: total } );
					if ( --remaining === 0 )
						send_response( data );
				});
			});
		});
	});
};

exports.user_info = function( req, res ) {

	TwitterUser.findOne( { "data.screen_name": req.params.username }, function( error, twitter_user ){

		if ( error )
			throw error;

		if ( twitter_user === null )
			throw new Error( "TwitterUser not found" );

		console.log( "twitter_user["+ req.params.username +"]["+ twitter_user._id +"]" )

		User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

			if ( error )
				throw error;

			if ( user === null )
				throw new Error( "User not found" );

			console.log( "user["+ user._id +"]" )

			Receipt.find( { user: user._id }, function( error, receipts ){

				if ( error )
					throw error;

				console.log( receipts )

				var data = {
					user: {
						total: 0,
						unique: 0,
						remaining: 0,
						receipts: {},
					},
					title: "@"+ twitter_user.data.screen_name,
				};
				var in_store = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99] ;

				if ( receipts !== null && receipts.length ) {
					receipts.forEach( function( receipt ){
						//console.log( receipt )
						if ( receipt.type === "instore" || receipt.type === "oldsite" ) {
							data.user.total++;
							var pos = in_store.indexOf( receipts.number );
							if ( pos !== -1 ) {
								data.user.unique++;
								data.user.remaining--;
								in_store.splice( pos, 1 );
							}
							if ( ! data.user.receipts[ receipt.number ] )
								data.user.receipts[ receipt.number ] = { count: 1 };
							else
								data.user.receipts[ receipt.number ].count++;
						}
					});
				}
				else {
					console.log( "user had no receipts ["+ user._id +"]" )
				}

				console.log( data )

				res.render( "user", data );
			});
		});
	});
};