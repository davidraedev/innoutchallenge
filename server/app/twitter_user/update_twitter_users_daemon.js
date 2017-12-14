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
	