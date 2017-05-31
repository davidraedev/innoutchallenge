var Twitter = require( "twitter" );
var Tweet = require( "../../model/tweet" );
var env = require( "node-env-file" )
var db = require( "../db" );
env( ".env" );

var fs = require( "fs" );

var client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	bearer_token: process.env.TWITTER_BEARER_TOKEN,
});

console.log( "A" );

db.connect().then( function( connection ){

	//client.get( "search/tweets", { q: "test" }, function( error, tweets, response ) {
/*
		fs.writeFile( "tweets.json", JSON.stringify( tweets ), function( error ){
			if ( error )
				throw new Error( error );
		});
*/
		fs.readFile( "tweets.json", function read( error, data ){

			if ( error )
				throw error;

			var tweets = JSON.parse( data );

			tweets.statuses.forEach(function( tweet_data ){

				console.log( tweet_data.id_str );

				Tweet.findOne(
					{ data: { id_str: tweet_data.id_str } },
					function( error, tweet ){

						if ( error )
							throw new Error( error );
						else if ( tweet === null )
							new Tweet( { data: tweet_data } ).save();
						else
							console.log( tweet.data.id );
					}
				);
/*
				Tweet.update(
					{ "id_str": tweet_data.id_str },
					{ "$set": tweet_data },
					{ upsert: true, setDefaultsOnInsert: true },
					function ( error ) {
						if ( error )
							throw new Error( error );
					}
				);
*/
			});

		});
/*
		console.log( "B" );

		if ( error )
			throw error;

		console.log( "c" );

		tweets.statuses.forEach(function( tweet_data ){

			console.log( tweet_data.id_str );

			Tweet.update(
				{ "id_str": tweet_data.id_str },
				{ "$set": tweet_data },
				{ upsert: true, setDefaultsOnInsert: true },
				function ( error ) {
					if ( error )
						throw new Error( error );
				}
			);

		});
		*/
	//});

}).catch( function( error ){
	if ( error )
		throw new Error( error );
});