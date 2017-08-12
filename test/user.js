const chai = require( "chai" );
const expect = chai.expect;
const db = require( "../app/db" );
const User = require( "../model/user" );
const userController = require( "../controller/user" );

const good_test_user_data = {
	name: "valid_test_user",
	join_date: new Date(),
	state: 1,
};

describe( "Create a new User via model", () => {

	before( ( done ) => {
		db.connect().then(() => {
			done();
		});
	});

/* model tests */

	describe( "with good data", () => {

		let good_test_user = new User( good_test_user_data );

		it( "Should not fail", ( done ) => {
			good_test_user.validate().then( ( result ) => {
				expect( result ).to.be.an( "undefined" );
				done();
			});
		});

	});

	describe( "Save the User to database via model", () => {

		it( "should return a User object", ( done ) => {

			let good_test_user = new User( good_test_user_data );

			good_test_user.save().then( ( result ) => {
				expect( result ).to.be.an( "object" );
				done();
			});

		});

	});

	describe( "Find the User from database via model", () => {

		it( "should return a non-null result", ( done ) =>{

			User.findOne({ name: good_test_user_data.name }).then( ( result ) => {
				expect( result ).to.be.an( "object" );
				done();
			});

		});
	});

	describe( "Delete the User from database via model", () => {

		it( "should not error", ( done ) => {

			User.remove({ name: good_test_user_data.name }, ( error ) => {
				expect( error ).to.be.an( "null" );
				done();
			});
			
		});

		it( "should not return any results", ( done ) => {

			User.find({ name: good_test_user_data.name }).then( ( results ) => {
				expect( results.length ).to.equal( 0 );
				done();
			});
		});
	});


/* controller tests */


	describe( "Save the User to database via controller", () => {

		it( "should return a User object", ( done ) => {
			userController.createUser( good_test_user_data ).then( ( result ) => {
				expect( result ).to.be.an( "object" );
				done();
			});
		});

	});

	describe( "Find single User from database via controller", () => {

		it( "should return a User object", ( done ) =>{

			userController.findUser({ name: good_test_user_data.name }).then( ( result ) => {
				expect( result ).to.be.an( "object" );
				done();
			});

		});
	});

	describe( "Fuzzy search single User from database via controller", () => {

		it( "should return a User object", ( done ) =>{

			userController.searchUser( good_test_user_data.name ).then( ( result ) => {
				expect( result ).to.be.an( "object" );
				return User.remove( good_test_user_data );
			})
			.then( () => {
				db.close();
				done();
			});

		});
	});

});

