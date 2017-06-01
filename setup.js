var fs = require( "fs" );

var mongo_log = "log/mongo.log";
var env_file = ".env";
var env_template = ".env.sample";

// create mongo log file
fs.access( mongo_log, fs.constants.F_OK, function( error ) {
	if ( error )
		throw new Error( error );
	fs.writeFile( mongo_log, "", function( error ) {
		if ( error )
			throw new Error( error );
		console.log( "Mongo Log Created." );
	});
});


// create blank .env file
fs.access( env_file, fs.constants.F_OK, function( error ) {
	if ( error ) {		
		fs.createReadStream( env_template ).pipe( fs.createWriteStream( env_file ) );
		console.log( "Unpopulated Environment File Created" );
	}
	else
		console.log( "Environment File Already Exists" );
});