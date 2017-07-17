const db = require( "../db" );
require( "dotenv" ).config();
const tweetController = require( "../../controller/tweet" );

function main() {

	return new Promise( ( resolve, reject ) => {

		tweetController.findTweets( { fetched: false, missing: 0 }, null, { limit: 100 } )
			.then( ( tweets_to_fetch ) => {

				if ( ! tweets_to_fetch || ! tweets_to_fetch.length ) {
					console.log( "no tweets needing fetching found" );
					resolve( true );
					return;
				}

				let status_ids_array = [];
				tweets_to_fetch.forEach( ( tweet ) => {
					status_ids_array.push( tweet.data.id_str );
				});

				console.log( "status_ids_array >>", status_ids_array );

				return tweetController.getTweetsFromLookupApp( status_ids_array );

			})
			.then( ( tweets ) => {

			//	console.log( "tweets >>", tweets );

				let keys = Object.keys( tweets.id );
				let remaining = keys.length;

				if ( ! keys.length )
					return resolve( true );

				keys.forEach( ( tweet_id ) => {

				//	console.log( "tweet_id >>", tweet_id );

					let tweet_data = tweets.id[ tweet_id ];

				//	console.log( "tweet_data >>", tweet_data );

					tweetController.findTweet( { "data.id_str": tweet_id } )
						.then( ( tweet ) => {

							if ( tweet === null )
								throw new Error( "Existing Tweet was not found [%s]", tweet_data.id_str );

							if ( tweet_data ) {
								tweet.data = tweetController.formatTweetData( tweet_data );
								tweet.fetched = true;
							}
							else {
								tweet.missing = 3;
							}
							tweet.fetch_date = new Date();
							tweet.save( ( error ) => {

								if ( error )
									throw error;

								if ( --remaining === 0 )
									resolve( true );
								else
									resolve( false );
							});
						})
						.catch( ( error ) => {
							throw error;
						});
				});
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
}

function loop( is_done ) {

	console.log( "counter [%s]", counter );

	if ( is_done || --counter === 0 ) {
		db.close();
		return;
	}

	setTimeout( () => {
		main().then( ( is_done_val ) => {
			loop( is_done_val );
		});
	}, 500 );

}

let counter = 200;
db.connect().then( () => {

	main().then( ( is_done_val ) => {
		loop( is_done_val );
	});

}).catch( ( error ) => {
	throw error;
});
