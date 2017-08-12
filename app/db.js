const mongoose = require( "mongoose" );
mongoose.Promise = require( "bluebird" );
console.log( "process.env.ENV_PATH", process.env.ENV_PATH )
require( "dotenv" ).config( { path: process.env.ENV_PATH } );

const connect = function( db_name ) {

	db_name = db_name || process.env.DB_NAME;
	const db_url = process.env.DB_HOST + "/" + db_name;

	console.log( "process.env.DB_HOST", process.env.DB_HOST )
	console.log( "process.env.DB_NAME", process.env.DB_NAME )
	console.log( "db_url", db_url )

	return new Promise( ( resolve, reject ) => {

		mongoose.connect( db_url )
			.then( () => {

				if ( mongoose.connection.readyState !== 1 )
					throw new Error( "DB not connected state["+ mongoose.connection.readyState +"]" );

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