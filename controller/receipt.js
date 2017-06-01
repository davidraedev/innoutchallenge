var Twitter = require( "twitter" );
var Receipt = require( "../model/receipt" );
var Tweet = require( "../model/tweet" );
var User = require( "../model/user" );
//var env = require( "node-env-file" )
var TwitterUser = require( "../model/twitter_user" );
var db = require( "../app/db" );
//env( ".env" );

// could change new user join date to the tweet time

db.connect(function( error ){
	if ( error )
		throw new Error( error );
});

function parseTweet( text ) {
	var has_hashtag = /\#innoutchallenge/i.test( text );
	if ( ! has_hashtag )
		return false;
	else {
		return {
			receipt: 1,
			date: new Date(),
		};
	}
}

function getUser( tweet_object, callback ){

	TwitterUser.findOne( { "data.id_str": tweet_object.user.id_str }, function( error, twitter_user ){

		if ( error )
			return callback( error );

		if ( ! twitter_user ) {
			console.log( "TwitterUser not found, creating" );
			var twitter_user = new TwitterUser({
				data: tweet_object.user,
			});
			twitter_user.save(function( error ){

				if ( error )
					throw new Error( error );

				console.log( "Creating User from TwitterUser" );

				var user = new User({
					join_date: new Date( tweet_object.created_at ),
					twitter_user: twitter_user._id,
				});
				user.save(function( error ){
					if ( error )
						throw new Error( error );
					console.log( "New User created" );
				});

			});
		}
		else {

			console.log( "TwitterUser found" );
			console.log( twitter_user );

			User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

				if ( error )
					return callback( error );

				if ( ! user )
					return callback( "Failed to find User via twitter_user objectid ["+ twitter_user._id +"]" );

				console.log( "User found" );
				console.log( user );
				callback( null, user );

			});
		}

	});
}

// this throws an error in the foreach, instead of dropping ot callback
var get_unparsed_tweets = function( callback ) {

	console.log( "get_unparsed_tweets" );

	Tweet.find( { parsed: false }, function( error, tweets ){

		if ( error )
			callback( error );

		if ( tweets === null ) {
			console.log( "No unparsed Tweets found" );
			callback();
		}

		tweets.forEach(function( tweet ){
			console.log( tweet );
			var text = tweet.toObject().data.text;
			var tweet_object = tweet.toObject().data;
			var parse = parseTweet( text );
			if ( ! parse ) {
				console.log( "Tweet did not contain innoutchallenge [%s]", text );
				tweet.update( { parsed: true }, function( error ){
					if ( error )
						throw new Error( error );
					console.log( "tweet updated, no change" );
				});
			}
			else {
				console.log( "Tweet contains innoutchallenge [%s]", text );
				tweet.update( { parsed: true }, function( error ){
					if ( error )
						throw new Error( error );
					console.log( "tweet updated, has receipt" );
				});
				getUser( tweet_object, function( error, user ){

					if ( error )
						throw new Error( error );

					console.log( user );

					var receipt = new Receipt({
						number: parse.number,
						date: parse.date,
						user: user._id,
					});

					receipt.save(function( error ){
						if ( error )
							throw new Error( error );
						console.log( "New Receipt Created" );
					});
				});
			}
		});

	});
};

module.exports = {
	get_unparsed_tweets: get_unparsed_tweets,
};