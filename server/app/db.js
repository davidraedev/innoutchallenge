const mongoose = require( "mongoose" );
mongoose.Promise = global.Promise;
require( "dotenv" ).config();

const connect = function( custom_db_name ) {
	console.log( "db connect" )

	let db_name = custom_db_name || process.env.DB_NAME;

	return new Promise( ( resolve, reject ) => {

		let connection_params = {
			useMongoClient: true,
		};

		// if database needs authentication
		if ( process.env.DB_USER && process.env.DB_PASSWORD ) {
			connection_params = {
				user: process.env.DB_USER,
				pass: process.env.DB_PASSWORD,
				auth: {
					authdb: db_name
				}
			};
		}

		const url = getUrl();

		console.log( "db connect url", url )

		mongoose.connect( url, connection_params )
			.then( () => {
				console.log( "db connect callback" )

				if ( mongoose.connection.readyState !== 1 )
					throw new Error( "DB not connected state["+ mongoose.connection.readyState +"]" );

				return resolve();
			})
			.catch( ( error ) => {
				return reject( error );
			});
	});
};

const close = function() {
	console.log( "db close" )
	return mongoose.connection.close();
};

const getUrl = function( with_credentials, custom_db_name ) {
	console.log( "db getUrl", with_credentials, custom_db_name )
	let db_name = custom_db_name || process.env.DB_NAME;
	if ( with_credentials && process.env.DB_USER && process.env.DB_PASSWORD )
		return "mongodb://"+ process.env.DB_USER +":"+ process.env.DB_PASSWORD +"@"+ process.env.DB_HOST +":"+ process.env.DB_PORT +"/"+ db_name;
	else
		return "mongodb://"+ process.env.DB_HOST + ":"+ process.env.DB_PORT +"/"+ db_name;
};

module.exports = {
	connect: connect,
	close: close,
	mongoose: mongoose,
	getUrl: getUrl,
};