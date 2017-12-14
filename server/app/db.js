const mongoose = require( "mongoose" );
mongoose.Promise = require( "bluebird" );
require( "dotenv" ).config( { path: ".env.production" } );

const connect = function( db_name ) {

	db_name = db_name || process.env.DB_NAME;
	const db_url = "mongodb://"+ process.env.DB_HOST + ":"+ process.env.DB_PORT +"/"+ db_name;

	return new Promise( ( resolve, reject ) => {

		mongoose.connect( db_url, {
			user: process.env.DB_USER,
			pass: process.env.DB_PASSWORD,
			auth: {
				authdb: db_name
			}
		})
			.then( () => {

				if ( mongoose.connection.readyState !== 1 )
					throw new Error( "DB not connected state ["+ mongoose.connection.readyState +"]" );

				resolve( null );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

const close = function() {
	return mongoose.connection.close();
};

module.exports = {
	connect: connect,
	close: close,
	mongoose: mongoose,
};