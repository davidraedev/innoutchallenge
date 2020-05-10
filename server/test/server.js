const chai = require( "chai" );
const expect = chai.expect;
const chaiHttp = require( "chai-http" );
const request = require( "request" );
chai.use( chaiHttp );
require( "dotenv" ).config()

describe( "Connect to Server", () => {

	let server;

	it( "responds to /", function( done ) {
		chai.request( process.env.FRONTEND_URL )
			.get( "/" )
			.end( function( error, response ) {
				expect( error ).to.be.a( "null" );
				expect( response ).to.have.status( 200 );
				done();
			});
	});

});