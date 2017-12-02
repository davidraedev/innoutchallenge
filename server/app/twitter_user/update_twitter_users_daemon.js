process.env.BASE = process.env.BASE || process.cwd();
const twitterUsersController = require( "../../controller/twitter_user" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );
const path = require( "path" );
const log_path = path.resolve( __dirname, "../../../log/update_twitter_users.log" );
const winston = require( "winston" );
const tsFormat = () => new Date();
const log = new ( winston.Logger )( {
	transports: [
		new ( winston.transports.Console )( {
			timestamp: tsFormat,
			colorize: true,
			level: "info",
		} ),
		new ( winston.transports.File )( {
			filename: log_path,
			timestamp: tsFormat,
			json: true,
			level: "debug",
			handleExceptions: true
		} ),
	]
});

const fetch_delay = 1000 * 60;

function callback() {

	return new Promise( ( resolve, reject ) => {

		twitterUsersController.updateTwitterUsers()
			.then( () => {
				resolve();
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

}

function start() {

	db.connect()
		.catch( ( error ) => {

			if ( error.name === "MongoError" || error.name === "MongooseError" ) {
				if ( /failed to connect to server/.test( error.message ) ) {
					log.error( "Failed to connect to to database, retrying in 5 seconds" );
					setTimeout( () => {
						start();
					}, 5000 );
				}
				else {
					log.error( "Database Error" );
				}
			}

			throw error;                                                                                                       
		})
		.then(() => {
			log.info( "DB connected, starting" );
			utils.loop( callback, fetch_delay );
		})
		.catch( ( error ) => {
			log.error( error );
			db.close();
		});
}

start();
	