var chai = require( "chai" );
var expect = chai.expect;
var db = require( "../app/db" );

describe( "Database", function(){

	describe( "Establishes connection", function(){

		it( "Does not throw an exception", function(){
			return db.connect().then( function( connection ){
				expect( connection ).to.be.an( "undefined" );
				db.close();
			}).catch( function( error ){
				throw new Error( error );
			});
		});

	});

});