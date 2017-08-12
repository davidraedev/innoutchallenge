const chai = require( "chai" );
const expect = chai.expect;
const db = require( "../app/db" );
const Receipt = require( "../model/receipt" );

const good_test_receipt_data = {
	number: 20,
	date: new Date(),
	type: 4,
};

describe( "Create a new Receipt via model", () => {

	before( ( done ) => {
		db.connect().then(() => {
			done();
		});
	});

/* model tests */

	describe( "with good data", () => {

		let good_test_receipt = new Receipt( good_test_receipt_data );

		it( "Should not fail", ( done ) => {
			good_test_receipt.validate().then( ( result ) => {
				expect( result ).to.be.an( "undefined" );
				done();
			});
		});

	});

	describe( "Save the Receipt to database via model", () => {

		it( "should return a Receipt object", ( done ) => {

			let good_test_receipt = new Receipt( good_test_receipt_data );

			good_test_receipt.save().then( ( result ) => {
				expect( result ).to.be.an( "object" );
				done();
			});

		});

	});

	describe( "Find the Receipt from database via model", () => {

		it( "should return a non-null result", ( done ) =>{

			Receipt.findOne( good_test_receipt_data ).then( ( result ) => {
				expect( result ).to.be.an( "object" );
				done();
			});

		});
	});

	describe( "Delete the Receipt from database via model", () => {

		it( "should not error", ( done ) => {

			Receipt.remove( good_test_receipt_data, ( error ) => {
				expect( error ).to.be.an( "null" );
				done();
			});
			
		});

		it( "should not return any results", ( done ) => {

			Receipt.find( good_test_receipt_data ).then( ( results ) => {
				expect( results.length ).to.equal( 0 );
				db.close();
				done();
			});
		});
	});
});

