
throw new Error( "Twitter's geo-search does not appear to return anything smaller than a city, as such we can't pre-fetch the twitter locations of the stores" )


var Store = require( "../../model/store" );
var TwitterUser = require( "../../model/twitter_user" );
var db = require( "../db.js" );
var Twitter = require( "twitter" );
require( "dotenv" ).config();

db.connect().then( function( connection ){

	Store.find({ "location.twitter_place": null, "location.city": /auburn/i }, [ "id", "location" ], { limit: 1 }, ( error, stores ) => {

		if ( error )
			throw error

		if ( ! stores.length ) {
			console.log( "All Stores have twitter locations" )
			return;
		}

		TwitterUser.findOne( { "data.screen_name": /^innoutchallenge$/i }, [ "oauth_token", "oauth_secret" ], ( error, twitter_user ) => {

			if ( error )
				throw error

			if ( ! twitter_user )
				throw new Error( "Failed to find @innoutChallenge user tokens" )

			let client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
				access_token_key: twitter_user.oauth_token,
				access_token_secret: twitter_user.oauth_secret,
			});

			let remaining = stores.length
			stores.forEach( ( store ) => {

				let query = {
					lat: 38,//store.location.latitude,
					long:  -120,//store.location.longitude,
					granularity: "poi",
				//	accuracy: "500ft",
					query: "burger",
				};

				console.log( "query >> ", query );

				client.get( "geo/reverse_geocode" /*"geo/search" */, query, function( error, twitter_place, response ) {

					console.log( "error >> ", error );

					if ( error )
						throw error;

					console.log( "twitter_place >> ", twitter_place.result.places );

					if ( --remaining === 0 )
						db.close()
	/*
					twitter_user.data = twitter_user_object;
					twitter_user.last_update = new Date();
					twitter_user.save( function( error ){

						if ( error )
							throw error;

						console.log( "successfully updated twitter user" );

						if ( --remaining === 0 )
							db.close()

					});
	*/
				});
			})
		})
	})

}).catch( function( error ){
	if ( error )
		throw error;
});