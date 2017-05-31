var db = require( "../db" );
var innoutLocations = require( "innout_locations" );
var Store = require( "../../model/store" );

db.connect().then( function( connection ){

	Store.find( {}, function( error, stores ) {

		if ( error )
			throw new Error( error );

		console.log( stores );

		db.close();

	});

}).catch( function( error ){
	throw new Error( error );
});