var controller = require( "../../controller/receipt" );

controller.parse_tweets_for_receipts( function( error ){
	if ( error )
		throw new Error( error );
	console.log( "Success!" );
});
