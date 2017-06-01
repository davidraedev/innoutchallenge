var controller = require( "../../controller/receipt" );

controller.get_unparsed_tweets( function( error ){
	if ( error )
		throw new Error( error );
	console.log( "Success!" );
});
