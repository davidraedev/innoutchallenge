const chai = require( "chai" );
const expect = chai.expect;
const db = require( "../app/db" );

describe( "Database", () => {

	describe( "Establishes connection", () => {

		/*
			0 = disconnected
			1 = connected
			2 = connecting
			3 = disconnecting
		*/
		it( "readyState is 1", () => {
			return db.connect().then( () => {
				expect( db.mongoose.connection.readyState ).to.equal( 1 );
				db.close();
			});
		});

	});

});