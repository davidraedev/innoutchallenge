var db = require( "../db" );
var innoutLocations = require( "innout_locations" );
var Receipt = require( "../../model/receipt" );

db.connect().then( function( connection ){

	Receipt.find( {}, function( error, receipts ) {

		if ( error )
			throw new Error( error );

		console.log( "receipts >>" );
		console.log( receipts );

		db.close();

	});

}).catch( function( error ){
	throw new Error( error );
});