const chai = require( "chai" );
const expect = chai.expect;
const Utils = require( "../controller/utils" );
require( "dotenv" ).config()

describe( "Utils", () => {

	describe( "Random number", () => {

		let positive_result = Utils.rand( 4, 4 );
		let negative_result = Utils.rand( -4, -4 );

		it( "should return 4", () => {

			expect( positive_result ).to.be.a( "number" );
			expect( positive_result ).to.equal( 4 );

		});

		it( "should return -4", () => {

			expect( negative_result ).to.be.a( "number" );
			expect( negative_result ).to.equal( -4 );

		});
	});

	describe( "Create the url for a user's public profile", () => {

		let username = "testuser";
		let result = Utils.createUserUrl( username );

		it( "should return a non-empty string", () => {
			expect( result ).to.be.a( "string" );
			expect( result ).to.not.be.empty;
		});

		it( "should match the format 'url/@user'", () => {
			expect( result ).to.equal( process.env.FRONTEND_DOMAIN +"/@"+ username );
		});

	});

	describe( "Add x number of a string to the beginning of a number", () => {

		let result_a = Utils.leftPad( 1, 4, "0" );

		it( "should return 0001", () => {
			expect( result_a ).to.be.a( "string" );
			expect( result_a ).to.equal( "0001" );
		});

		let result_b = Utils.leftPad( 2, 4, "1" );

		it( "should return 1112", () => {
			expect( result_b ).to.be.a( "string" );
			expect( result_b ).to.equal( "1112" );
		});

		let result_c = Utils.leftPad( 2, 4, 1 );

		it( "should not add numbers, only append", () => {
			expect( result_b ).to.be.a( "string" );
			expect( result_b ).to.equal( "1112" );
		});

	});

});

