var fs = require( "fs" );

var mongo_log = "log/mongo.log";

fs.access( mongo_log, fs.constants.F_OK, ( error ) => {

	if ( ! error )
		return;

	fs.writeFile( mongo_log, "", function( error ) {

		if ( error )
			return console.log( error );

		console.log( "The file was saved!" );
	});

});
