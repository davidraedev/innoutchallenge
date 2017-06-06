var controller = require( "../../controller/tweet" );

controller.search_tweets_app( function( error ){
	if ( error )
		throw new Error( error );
	console.log( "Success!" );
});
