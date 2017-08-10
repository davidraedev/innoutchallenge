var chai = require( "chai" );
var expect = chai.expect;
var db = require( "../app/db" );

describe( "Database", function(){

	describe( "Establishes connection", function(){

		/*
			0 = disconnected
			1 = connected
			2 = connecting
			3 = disconnecting
		*/
		it( "readyState is 1", function(){
			return db.connect( "test" ).then( function(){
				expect( db.mongoose.connection.readyState ).to.equal( 1 );
				db.close();
			});
		});

	});

});