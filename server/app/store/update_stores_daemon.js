process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "./server/controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/update_stores.log" } );

const db = require( "../db" );
const storeController = require( "../../controller/store" );
const utils = require( "../../controller/utils" );
const appController = require( "../../controller/app" );
const PromiseEndError = require( "../error/PromiseEndError" );
const moment = require( "moment" );

const fetch_delay = 60 * 60 * 24; // 24 hours in seconds

function callback() {

	return new Promise( ( resolve, reject ) => {

		appController.getStoreFetchDate()
			.then( ( result ) => {
				let fetch_cutoff = moment().subtract( fetch_delay, "seconds" );
				if ( ! result || fetch_cutoff.isAfter( result.store_fetch_date ) )
					return storeController.updateStores()
				throw new PromiseEndError( "Not time yet!" );
			})
			.then( () => {
				log( "["+ new Date() +"] loop" );
				resolve();
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

}

db.connect()
	.then(() => {
		log( "["+ new Date() +"] DB connected, updateStores looping" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		log( error );
		logStream.end();
		db.close();
	});