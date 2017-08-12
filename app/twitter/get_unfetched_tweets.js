const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );

db.connect().then(() => {

	tweetController.getUnfetchedTweets()
		.then( ( tweets ) => {
			console.log( "tweets >> ", tweets );
			db.close();
		})
		.catch( ( error ) => {
			throw error;
		});
		
}).catch( ( error ) => {
	throw error;
});