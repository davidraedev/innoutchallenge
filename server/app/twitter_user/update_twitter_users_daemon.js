process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "../../controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/update_twitter_users.log" } );
const twitterUsersController = require( "../../controller/twitter_user" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

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

db.connect()
	.then(() => {
		log( "DB connected, starting" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		log( error );
		db.close();
	});