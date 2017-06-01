var controller = require( "../../controller/tweets" );

controller.search_tweets_app( function( error ){
	if ( error )
		throw new Error( error );
	console.log( "Success!" )
});