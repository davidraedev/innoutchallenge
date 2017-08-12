const db = require( "../db" );
require( "dotenv" ).config( process.env.ENV_PATH );

const RawStreamObject = require( "../../model/raw_stream_object" );

let this_twitter_user;
db.connect()
	.then( () => {
		return RawStreamObject.find( {} );
	})
	.then( ( raws ) => {

		raws.forEach( ( raw ) => {
			if ( ! raw.data.text )
				console.log( raw );
		});

		db.close();

	})
	.catch( ( error ) => {
		db.close();
		throw error;
	});