var Twitter = require( "twitter" );
var Tweet = require( "../model/tweet" );
require( "dotenv" ).config()
var TwitterUser = require( "../model/twitter_user" );
var TwitterPlace = require( "../model/twitter_place" );
var db = require( "../app/db" );
var wordToNumber = require( "word-to-number-node" );
var w2n = new wordToNumber();

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
				{ "data.id_str": tweet_data.id_str },
				function( error, tweet ){

					if ( error )
						return callback( error );

					if ( tweet === null )
						new Tweet( { data: tweet_data, source: "search" } ).save( callback );

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
					{ "data.id_str": tweet_data.id_str },
					function( error, tweet ){

						if ( error )
							throw new Error( error );

						if ( tweet === null )
							new Tweet( { data: tweet_data, source: "user" } ).save();

						if ( --remaining === 0 && typeof callback == "function" )
							callback();

					}
				);

			});

		});

	});

};

var get_tweets_app = function( status_ids_array, callback ) {

	console.log( "get_tweets_app" );

	var client = new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		bearer_token: process.env.TWITTER_BEARER_TOKEN,
	});

	const ids = status_ids_array.join( "," );

	client.get( "statuses/lookup", { id: ids, map: true }, function( error, tweets, response ) {

		if ( error )
			return callback( error );

		console.log( tweets );

		callback( null, tweets );
	});
};

function parseForInStoreReceipt( text ) {
	let number = parseForInStoreDigits( text ) || w2n.parse( text )[0];
	if ( number && number !== 69 && number > 0 && number < 100 )
		return number;
	return false;
}

function parseForDriveThruReceipt( text ) {
	let number = parseForDriveThruDigits( text ) || w2n.parse( text );
	if ( number && number > 3999 && number < 5000 )
		return number;
	return false;
}

function parseForStore( tweet ) {

	if ( ! tweet.location )
		return false;

	if ( /in( |-)n( |-)out( |-)/i.test( tweet.location.name ) ) {
		// get twitter place coords
		// geosearch the database for matching stores
		// add twitter place to store
		// add store to receipt
	}

}

function isRetweet( tweet ) {
	if ( tweet.retweet || /^rt\s/i.test( tweet.data.text ) )
		return true;
	return false
}

function hasIgnoreFlag( tweet ) {
	if ( /\#\!/i.test( tweet.data.text ) )
		return true;
	return false
}

function isIgnoredUser( tweet ) {
	if ( tweet.data.user.id_str === "584408608" || tweet.data.user.id_str === "1487483659" )
		return true;
	return false
}

function parseForInStoreDigits( text ) {
	let matches = text.match( /number\s+(\d{1,2})/i );
	if ( ! matches )
		matches = text.match( /(?:^|[\s!.,])(\d{1,2})(?:[\s!.,]|$)/ );
	if ( matches )
		return matches[1].trim();
	return false;
}

function parseForDriveThruDigits( text ) {
	let matches = text.match( /number\s+(4\d{3})/i );
	if ( ! matches )
		matches = text.match( /(?:^|[\s!.,])(4\d{3})(?:[\s!.,]|$)/ );
	if ( matches )
		return matches[1].trim();
	return false;
}

var parseTweets = function( callback ) {

	console.log( "parseTweets" );

	db.connect().then( () => {

		Tweet.find({ fetched: true, parsed: false }, ( error, tweets ) => {

			if ( error )
				return callback( error );

			if ( ! tweets.length )
				return callback( "no tweets found" );

			let remaining = tweets.length;
			tweets.forEach( ( tweet ) => {
				console.log( "tweet.data.text >> ", tweet.data.text )
				
	//			if ( isRetweet( tweet ) || hasIgnoreFlag( tweet ) || isIgnoredUser( tweet ) )
					// no receipt
				
	//			if (  )
				let number = w2n.parse( tweet.data.text );
				console.log( "number [%s]", number );
				if ( --remaining === 0 )
					db.close()
			})
		})
	})
};

module.exports = {
	search_tweets_app: search_tweets_app,
	search_tweets_user: search_tweets_user,
	get_tweets_app: get_tweets_app,
	parseTweets: parseTweets,
	parseForInStoreReceipt: parseForInStoreReceipt,
};