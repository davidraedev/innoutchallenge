const db = require( "../db" );
const https = require( "https" );
require( "dotenv" ).config()

const tweet_controller = require( "../../controller/tweet" );

//const User = require( "../../model/user" );
//const TwitterUser = require( "../../model/twitter_user" );
const Tweet = require( "../../model/tweet" );
//const Store = require( "../../model/store" );
//const Receipt = require( "../../model/receipt" );

const ObjectId = require( "mongoose" ).Types.ObjectId;


function main( callback ) {

	Tweet.find( { fetched: false }, ( error, tweets ) => {

		if ( error )
			throw error;

		if ( ! tweets || ! tweets.length ) {
			console.log( "no tweets needing fetching found" );
			callback( true );
			return;
		}

		let status_ids_array = [];
		tweets.forEach( ( tweet ) => {
			status_ids_array.push( tweet.data.id_str );
		});

		console.log( "status_ids_array >>", status_ids_array )

		tweet_controller.get_statuses_app( status_ids_array, ( error, tweets ) => {

			if ( error )
				throw error;

			//console.log( "tweets >>", tweets )

			let remaining = Object.keys( tweets.id ).length;

			Object.keys( tweets.id ).forEach( ( tweet_id, i ) => {

				let tweet_data = tweets.id[ tweet_id ];

			//	let index = i;
			//	let tweet_id = tweet_data.id_str

				Tweet.findOne(
					{ "data.id_str": tweet_id },
					( error, tweet ) => {

						if ( error )
							throw error

						if ( tweet === null )
							throw new Error( "Existing Tweet was not found [%s]", tweet_data.id_str )

						if ( tweet_data )
							tweet.data = tweet_data;
						else
							tweet.missing = true;
						tweet.fetched = true;
						tweet.fetch_date = new Date();
						tweet.save( ( error ) => {

							if ( error )
								throw error;

							if ( --remaining === 0 )
								main( callback );
						})
					}
				);
			});
		})

	}).limit( 100 );
}

db.connect().then( () => {

	let counter = 10;
	main( ( is_done ) => {
		console.log( "counter [%s]", counter )

		if ( is_done || --counter === 0 ) {
			db.close();
			return;
		}

		setTimeout( () => {
			main();
		}, 700 );

	});

}).catch( ( error ) => {
	throw error;
});
