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

const fetch_delay = 1000 * 60 * 60 * 24; // 24 hours in seconds

function callback() {

	log.info( "loop" );

	return new Promise( ( resolve, reject ) => {

		db.connect()
			.then( ( store_fetch_date ) => {
				return appController.getStoreFetchDate();
			})
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
				log.info( stores_updated + " stores updated" );
				return appController.setStoreFetchDate();
			})
			.then( () => {
				resolve();
				db.close();
			})
			.catch( ( error ) => {
				if ( error instanceof PromiseEndError )
					return resolve();
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