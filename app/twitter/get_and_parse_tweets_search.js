var controller = require( "../../controller/tweet" );
var db = require( "../db" );

db.connect().then(() => {

	controller.get_tweets_from_search_app()
		.then( ( vals ) => {

			console.log( "[%s] tweets retrieved, [%s] tweets saved", vals.found, vals.saved );

			controller.parseTweets()
				.then( ( vals ) => {

					console.log( "[%s] tweets found, [%s] tweets parsed", vals.found, vals.parsed );
					db.close();

				})
				.catch( ( error ) => {
					throw error;
				});

		})
		.catch( ( error ) => {
			throw error;
		});
		
}).catch( ( error ) => {
	throw error;
});