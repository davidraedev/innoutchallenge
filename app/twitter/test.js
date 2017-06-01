var controller = require( "../../controller/tweets" );

/*
controller.search_tweets_app( function( error ){
	if ( error )
		throw new Error( error );
	console.log( "Success!" );
});
*/
var User = require( "../../model/user" );
User.findOne( {}, function( error, user ){

	if ( error )
		throw new Error( error );

	if ( user === null )
		throw new Error( "User not found" );

	console.log( user );
	controller.search_tweets_user( user, function( error ){
		if ( error )
			throw new Error( error );
		console.log( "Success!" );
	});
});
