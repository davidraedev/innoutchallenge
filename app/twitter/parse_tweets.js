var controller = require( "../../controller/tweet" );

controller.parse_tweets( ( error ) => {
	if ( error )
		throw error
})
