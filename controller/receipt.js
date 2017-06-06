// use strict;

var Receipt = require( "../model/receipt" );
var Tweet = require( "../model/tweet" );
var User = require( "../model/user" );
var TwitterUser = require( "../model/twitter_user" );
var db = require( "../app/db" );
var WordToNumber = require( "word-to-number-node" );
var w2n = new WordToNumber();

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

function getUser( tweet_object, callback ) {

	TwitterUser.findOne( { "data.id_str": tweet_object.user.id_str }, function( error, twitter_user ){

		if ( error )
			return callback( error );

		if ( ! twitter_user ) {
			console.log( "TwitterUser not found, creating" );
			twitter_user = new TwitterUser({
				data: tweet_object.user,
			});
			twitter_user.save(function( error ){

				if ( error )
					throw new Error( error );

				console.log( "Creating User from TwitterUser" );

				User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

					if ( error )
						return callback( error );

					if ( ! user ) {

						var user = new User({
							twitter_user: twitter_user._id,
						});

						if ( tweet_object.created_at )
							user.join_date = new Date( tweet_object.created_at );

						user.save(function( error, user ){
							if ( error )
								throw new Error( error );
							callback( null, user, twitter_user );
						});

					}
					else {
						callback( null, user, twitter_user );
					}

				});

			});
		}
		else {

			console.log( "TwitterUser found" );
			console.log( twitter_user );

			User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

				if ( error )
					return callback( error );

				if ( ! user ) {
					console.log( "user not found, creating" );
					var user = new User({
						twitter_user: twitter_user._id,
					});

					if ( tweet_object.created_at )
						user.join_date = new Date( tweet_object.created_at );

					user.save(function( error, user ){
						if ( error )
							throw new Error( error );
						callback( null, user, twitter_user );
					});
				}
				else {
					console.log( "User found" );
					console.log( user );
					callback( null, user, twitter_user );
				}

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

function isDisallowedAccount( screen_name ){
	let disallowed = [ "innoutchallenge", "innoutreceipts" ];
	return ( disallowed.indexOf( screen_name ) !== -1 );
}

function isRetweet( tweet ) {
	return ( tweet.retweeted_status );
}

function isIgnoredTweet( tweet ) {
	// ignore tweets containing hashbang "#!"
	return /(?!\/)#\!(?!\/)/.test( tweet.text );
}

function parseForInStoreReceipt( text ) {

	text = text.toLowerCase();
	var number = null;

	let r = /(((one|two|three|four|five|six|seven|eight|nine) (thousand))|((one|two|three|four|five|six|seven|eight|nine)-(thousand)))/;
	text = text.replace( r, "" );


	// parse for digits
	var matches = text.match( /(?:^|\s)(\d{1,2})(?:[\s\!\.]|$)/ );// /((^| )([\d]{1,2})([\s\!\.]|$)/
	
	if ( matches && matches[1] )
		number = parseInt( matches[1] ) || null;

	if ( ! number )
		number = parseInt( w2n.parse( text ) );

	if ( ( number > 0 && number < 69 ) || ( number > 69 && number < 99 ) )
		return number;

	return null;

}

function parseForDriveThruReceipt( text ) {

	text = text.toLowerCase();

	var matches = text.match( /!\#4\d{3}/ );
	console.log( "matches >>" );
	console.log( matches );
	if ( matches.length )
		return matches[0];

	var number = w2n.parse( text );

	if ( number > 3999 && number < 5000 )
		return number;

	return null;

}

var parse_tweets_for_receipts = function( callback ) {

	Tweet.find( { parsed: false, flagged: false }, function( error, tweets ){

		if ( error )
			return callback( error );

		if ( ! tweets || ! tweets.length ) {
			console.log( "no tweets found" );
			callback();
		}

		tweets.forEach(function( tweet ){

			let data = tweet.toObject().data;

			tweet.parsed = true;
			tweet.save( function( error ){
				if ( error )
					throw new Error( error );
			});


			if ( isDisallowedAccount( data.user.screen_name ) ) {
				console.log( "Disallowed Account [%s]", data.user.screen_name );
				return;
			}

			if ( isRetweet( data ) ) {
				console.log( "Is Retweet" );
				return;
			}

			if ( isIgnoredTweet( data ) ) {
				console.log( "Tweet Ignored" );
				return;
			}

			let receipt_number = parseForInStoreReceipt( data.text );
			let receipt_type = "instore";
			if ( ! receipt_number ) {
				receipt_number = parseForDriveThruReceipt( data.text );
				receipt_type = "drivethru";
			}
			if ( receipt_number ) {

				getUser( data, function( error, user ){
					if ( error )
						throw new Error( error );

					let receipt = new Receipt({
						number: receipt_number,
						date: new Date( data.created_at ),
						tweet: tweet._id,
						user: user._id,
						type: receipt_type,
					});

					receipt.save( function( error ){
						if ( error )
							throw new Error( error );
					});
				});
			}
		});

	});

};

module.exports = {
	get_unparsed_tweets: get_unparsed_tweets,
	parse_tweets_for_receipts: parse_tweets_for_receipts,
	get_user_from_twitter_id: getUser,
};