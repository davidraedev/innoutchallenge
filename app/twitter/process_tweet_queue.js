const TweetQueue = require( "../../model/tweet_queue" );
const TwitterUser = require( "../../model/twitter_user" );
const User = require( "../../model/user" );
const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );
require( "dotenv" ).config( process.env.ENV_PATH );

let this_user,
	this_tweet_queue,
	this_twitter_user;

db.connect().then(() => {
	return TweetQueue.find( { send_date: { $lt: new Date() }, done: false, failed: false } ).limit( 10 );
})
.then(( tweet_queue ) => {
	this_tweet_queue = tweet_queue;
	return User.findOne( { _id: tweet_queue.user } );
})
.then(( user ) => {
	if ( ! user )
		throw new Error( "No User Found" );
	this_user = user;
	return TwitterUser.findOne( { _id: user.twitter_user } );
})
.then(( twitter_user ) => {
	if ( ! twitter_user )
		throw new Error( "No TwitterUser Found" );
	this_twitter_user = twitter_user;

	let i = 0;
	let remaining = this_tweet_queue.length;

	function sendTweetSync() {

		if ( --remaining === 0 ) {
			db.close();
			return;
		}

		tweetController.sendTweet( twitter_user, this_tweet_queue[ i ].params )
			.then(() => {
				setTimeout(() => {
					sendTweetSync();
				}, 500 );
			})
			.catch( ( error ) => {
				throw error;
			});
	}
	sendTweetSync();
	console.log( "this_tweet_queue", this_tweet_queue );

})
.catch( ( error ) => {
	console.log( error );
	db.close();
});