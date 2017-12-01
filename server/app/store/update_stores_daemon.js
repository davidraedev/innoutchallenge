process.env.BASE = process.env.BASE || process.cwd();
const db = require( "../db" );
const storeController = require( "../../controller/store" );
const utils = require( "../../controller/utils" );
const appController = require( "../../controller/app" );
const PromiseEndError = require( "../error/PromiseEndError" );
const moment = require( "moment" );
const path = require( "path" );
const log_path = path.resolve( __dirname, "../../../log/update_twitter_users.log" );
const winston = require( "winston" );
const tsFormat = () => new Date();
const logger = new ( winston.Logger )( {
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

const fetch_delay = 60 * 60 * 24; // 24 hours in seconds

const log_loop_interval = 1000 * 60 * 10; // keepalive log every ten minutes
let last_log = +new Date();

function callback() {

	if ( ( +new Date() - log_loop_interval ) > last_log ) {
		log.info( "loop" );
		last_log = +new Date();
	}

	return new Promise( ( resolve, reject ) => {

		appController.getStoreFetchDate()
			.then( ( store_fetch_date ) => {

				let fetch_cutoff = moment().subtract( fetch_delay, "seconds" );

				if ( ! store_fetch_date || fetch_cutoff.isAfter( store_fetch_date ) ) {
					return storeController.updateStores();
				}
				else {
					throw new PromiseEndError();
				}
			})
			.then( ( stores_updated ) => {
				log.info( stores_updated +" stores updated" );
				return appController.setStoreFetchDate();
			})
			.then( () => {
				resolve();
			})
			.catch( ( error ) => {
				if ( error instanceof PromiseEndError )
					resolve();
				reject( error );
			});
	});

}

function start() {

	db.connect()
		.catch( ( error ) => {

			if ( error.name === "MongoError" ) {
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
			utils.loop( callback, ( fetch_delay * 1000 ) );
		})
		.catch( ( error ) => {
			log.error( error );
			db.close();
	});
}

start();