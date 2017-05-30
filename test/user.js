var chai = require( "chai" );
var expect = chai.expect;
var db = require( "../app/db" );
var User = require( "../model/user" );


describe( "Create a new User", function(){

	before( function( done ){
		db.connect( null, function(){ done(); });
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
			good_test_user.validate().then(function( result ){
				expect( result ).to.be.an( "undefined" );
			}).catch(function( error ){
				throw new Error( error );
			});
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

