var db = require( "./app/db" );
var Tweet = require( "./model/tweet" );
var Receipt = require( "./model/receipt" );
var User = require( "./model/user" );
var TwitterUser = require( "./model/twitter_user" );
var TweetQueue = require( "./model/tweet_queue" );

db.connect().then(() => {

	return new Promise( ( resolve, reject ) => {

		Tweet.collection.drop();
		Receipt.collection.drop();
		User.collection.drop();
		TwitterUser.collection.drop();
		TweetQueue.collection.drop();
		setTimeout(()=>{db.close()},4000);

	});
})
.then(()=>{})
.catch((error)=>{
	if ( /ns not found/.test( error ) )
		return;
	throw error;
});