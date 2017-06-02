var controller = require( "../../controller/twitter_user" );

var User = require( "../../model/user" );
User.findOne( {}, function( error, user ){

	if ( error )
		throw new Error( error );

	if ( user === null )
		throw new Error( "User not found" );

	console.log( user );
	controller.refresh_user( user, function( error ){
		if ( error )
			throw new Error( error );
		console.log( "Success!" );
	});
});
