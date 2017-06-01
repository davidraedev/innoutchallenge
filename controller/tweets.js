var Twitter = require( "twitter" );
var Tweet = require( "../model/tweet" );
var env = require( "node-env-file" )
var TwitterUser = require( "../model/twitter_user" );
var db = require( "../app/db" );
env( ".env" );

db.connect(function( error ){
	if ( error )
		throw new Error( error );
});

// this won't exit immediately if it error in the foreach, it'll continue the loop
var search_tweets_app = function( callback ) {

	console.log( "search_tweets_app" );

	var client = new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		bearer_token: process.env.TWITTER_BEARER_TOKEN,
	});

	client.get( "search/tweets", { q: "innoutchallenge" }, function( error, tweets, response ) {

		if ( error )
			return callback( error );

		var remaining = tweets.statuses.length;

		tweets.statuses.forEach( function( tweet_data, i ){

			console.log( i )

			Tweet.findOne(
				{ data: { id_str: tweet_data.id_str } },
				function( error, tweet ){

					if ( error )
						return callback( error );

					if ( tweet === null )
						new Tweet( { data: tweet_data } ).save( callback );

					if ( --remaining === 0 && typeof callback == "function" )
						callback( null );

				}
			);

		});

	});
};

var search_tweets_user = function( user, callback ) {

	console.log( "search_tweets_user" );
	console.log( user );

	TwitterUser.findOne( { _id: user.twitter_user }, function( error, twitter_user ) {

		if ( error )
			throw new Error( error );

		if ( twitter_user === null )
			throw new Error( "Failed to find TwitterUser" );

		var client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
			access_token_key: twitter_user.oauth_token,
			access_token_secret: twitter_user.oauth_secret,
		});

		client.get( "statuses/user_timeline", { user_id: twitter_user.data.id_str }, function( error, tweets, response ) {

			if ( error )
				throw error;

			console.log( "tweets >>" );
			console.log( tweets );

			var remaining = tweets.length;

			tweets.forEach(function( tweet_data ){

				Tweet.findOne(
					{ data: { id_str: tweet_data.id_str } },
					function( error, tweet ){

						if ( error )
							throw new Error( error );

						if ( tweet === null )
							new Tweet( { data: tweet_data } ).save();

						if ( --remaining === 0 && typeof callback == "function" )
							callback();

					}
				);

			});

		});

	});

};

module.exports = {
	search_tweets_app: search_tweets_app,
	search_tweets_user: search_tweets_user,
}