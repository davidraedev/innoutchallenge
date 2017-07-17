var TweetQueue = require( "../../model/tweet_queue" );
var db = require( "../db" );

db.connect().then(() => {
	return TweetQueue.find( { send_date: { $lt: new Date() }, done: false, failed: false } );
}).then( ( tweet_queue ) => {
	console.log( "tweet_queue", tweet_queue );
}).catch( ( error ) => {
	throw error;
});