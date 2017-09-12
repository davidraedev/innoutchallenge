process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "../../controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/update_stores.log" } );
const db = require( "../db" );
const storeController = require( "../../controller/store" );
const utils = require( "../../controller/utils" );
const appController = require( "../../controller/app" );
const PromiseEndError = require( "../error/PromiseEndError" );
const moment = require( "moment" );

const fetch_delay = 60 * 60 * 24; // 24 hours in seconds

const log_loop_interval = 1000 * 60 * 10; // keepalive log every ten minutes
let last_log = +new Date();

function callback() {

	if ( ( +new Date() - log_loop_interval ) > last_log ) {
		log( "loop" );
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
				log( stores_updated +" stores updated" );
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

db.connect()
	.then(() => {
		log( "DB connected, starting" );
		utils.loop( callback, ( fetch_delay * 1000 ) );
	})
	.catch( ( error ) => {
		log( error );
		db.close();
	});