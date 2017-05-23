var chai = require( "chai" );
var expect = chai.expect;
var db = require( "../app/db" );
var User = require( "../model/user" );


describe( "Create a new User", function(){

	before( function( done ){
		db.connect( null, function(){ done(); });
	});

	describe( "with bad data", function(){

		var bad_test_user = new User({
			name: "Fluffy",
		});

		it( "Should fail", function(){
			var error = bad_test_user.validateSync();
			console.log( "error >>" )
			console.log( error )
			expect( error ).to.not.be.an( "undefined" );
		});

	});

	var good_test_user = new User({
		join_date: new Date(),
		twitter: [{
			oauth_secret: "dfgfdsgsdfg",
			user: {
				id_str: "#@$23423432423",
				name: "Test User",
			},
		}],
		tweets: [],
		receipts: [],
	});

	describe( "with good data", function(){

		it( "Should not fail", function(){
			var error = good_test_user.validateSync();
			expect( error ).to.be.an( "undefined" );
		});

	});

	describe( "Save the User to database", function(){

		it( "should return a Mongo WriteResult object", function(){

			good_test_user.save().then( function( result ){
				expect( result ).to.be.an( "object" );
			}).catch( function( error ){
				throw new Error( error );
			});

		});

	});

});

