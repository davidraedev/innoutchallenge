const TwitterStream = require( "node-tweet-stream" )
const TwitterUser = require( "../../model/twitter_user" );
const db = require( "../db" );
require( "dotenv" ).config( process.env.ENV_PATH );

const RawStreamObject = require( "../../model/raw_stream_object" );

function saveRawStreamObject( obj ) {
	return RawStreamObject.create({ data: obj, bundle: 4 });
}

let this_twitter_user;
db.connect()
	.then( () => {
		return TwitterUser.findOne( { "data.id_str": process.env.TWITTER_STREAMING_USER_ID } );
	})
	.then( ( twitter_user ) => {

		if ( ! twitter_user )
			throw new Error( "TwitterUser not found" );

		if ( ! twitter_user.oauth_token_admin || ! twitter_user.oauth_secret_admin )
			throw new Error( "TwitterUser does not have credentials" );

		this_twitter_user = twitter_user;

		return RawStreamObject.find( { "data.user.id_str": { $exists: true } }, [ "data.user.id_str" ] ).limit( 5000 ).lean();

	})
	.then( ( raw_stream_objects ) => {

		raw_stream_objects.forEach( ( raw_stream_object, i ) => {
			raw_stream_objects[ i ] = raw_stream_object.data.user.id_str;
		});
		const ids = raw_stream_objects.join( "," );
		
		const stream = new TwitterStream({
			consumer_key: process.env.TWITTER_CONSUMER_KEY_ADMIN,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET_ADMIN,
			token: this_twitter_user.oauth_token_admin,
			token_secret: this_twitter_user.oauth_secret_admin
		});

		let count = 0;
		stream.on( "tweet", function ( tweet ) {
			saveRawStreamObject( tweet )
				.then( () => {
					console.log( ++count );
				})
				.catch( ( error ) => {
					throw error;
					db.close();
				});
		});

		stream.on( "error", function ( error ) {
			throw error;
		});

		//stream.follow( ids );
		stream.track( "happy" );

	})
	.catch( ( error ) => {
		db.close();
		throw error;
	});