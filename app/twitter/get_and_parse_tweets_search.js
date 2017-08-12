const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );

db.connect().then(() => {
	return tweetController.getTweetsFromSearchApp();
})
.then( ( vals ) => {
	console.log( "[%s] tweets retrieved, [%s] tweets saved", vals.found, vals.saved );
	return tweetController.parseTweets( true, true );
})
.then( ( vals ) => {
	console.log( "done" );
	db.close();
})
.catch( ( error ) => {
	throw error;
});