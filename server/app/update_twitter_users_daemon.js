process.env.BASE = process.env.BASE || process.cwd();
const twitterUsersController = require( "../controller/twitter_user" );
const db = require( "./db" );
const utils = require( "../controller/utils" );
const path = require( "path" );
const log = require( "../controller/log" )( path.resolve( __dirname, "../../log/update_twitter_users.log" ) );

const fetch_delay = 1000 * 60;

log.info( "Starting" );

function callback() {

	return new Promise( ( resolve, reject ) => {

		db.connect()
			.then( () => {
				log.info( "DB connected, starting" );
				return twitterUsersController.updateTwitterUsers();
			})
			.then( () => {
				resolve();
				db.close();
			})
			.catch( ( error ) => {
				log.error( error );
				db.close();
				if ( error.name === "MongoError" || error.name === "MongooseError" )
					resolve( 1000 * 5 );
				else
					resolve();
			});
	});

}

utils.loop( callback, fetch_delay );
	