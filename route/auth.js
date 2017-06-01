var express = require( "express" );
var router = express.Router();
var env = require( "node-env-file" );
env( ".env" );
var TwitterUser = require( "../model/twitter_user" );
var User = require( "../model/user" );

var OAuth = require( "oauth" ).OAuth;
var oauth = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	process.env.TWITTER_CONSUMER_KEY,
	process.env.TWITTER_CONSUMER_SECRET,
	"1.0",
	"http://localhost:3000/auth/twitter/callback",
	"HMAC-SHA1"
);

router.get( "/login", ( request, res ) => {
	res.render( "login", { login_url: "/auth/twitter" } );
});

router.get( "/auth/twitter",
	function( req, res ) {
		oauth.getOAuthRequestToken( function( error, oauth_token, oauth_token_secret, results ) {
			if ( error ) {
				console.log( error );
				res.send( "Authentication Failed!" );
			}
			else {
				req.session.oauth = {
					token: oauth_token,
					token_secret: oauth_token_secret
				};
				//console.log( req.session.oauth );
				res.redirect( "https://twitter.com/oauth/authenticate?oauth_token=" + oauth_token );
			}
		});
	}
);
	
router.get( "/auth/twitter/callback",
	function( req, res, next ) {

		if ( req.session.oauth ) {
			req.session.oauth.verifier = req.query.oauth_verifier;
			var oauth_data = req.session.oauth;

			oauth.getOAuthAccessToken(
				oauth_data.token,
				oauth_data.token_secret,
				oauth_data.verifier,
				function( error, oauth_access_token, oauth_access_token_secret, results ) {

					if ( error ) {
						console.log( error );
						res.send( "Authentication Failure!" );
					}
					else {

						/*

						{
							user_id: '15228900',
							screen_name: 'daraeman',
							x_auth_expires: '0'
						}

						{
							token: 'x7_uZwAAAAAADQ0kAAABXGHl13s',
							token_secret: '44gt7Kvr7HHf72Nk6EdE58lYnfAdclbA',
							verifier: 'XsNv71vViErr8dTBt7N6Bn3Tk4aQpYrQ',
							access_token: '15228900-oc7mMGevGLgzdnunKwuWsU1L2HEjvR2etPbhZ2I',
							access_token_secret: '2yIv1U38BlJAARmibYkrp94UmadS8y4qkQG8PtOQ24'
						}

						*/

						req.session.oauth.access_token = oauth_access_token;
						req.session.oauth.access_token_secret = oauth_access_token_secret;
						console.log( results, req.session.oauth );
						console.log( "user_id [%s]", results.user_id )
						TwitterUser.findOne(
							{ "data.id_str": results.user_id },
							function( error, twitter_user ){

								if ( error )
									throw new Error( error );
								else if ( twitter_user === null ) {
									console.log( "No User, creating" )
									new TwitterUser( {
										oauth_token: req.session.oauth.access_token,
										oauth_secret: req.session.oauth.access_token_secret,
										data: {
											id_str: results.user_id,
											screen_name: results.screen_name
										}
									}).save( function( error, twitter_user ){

										console.log( "twitter_user >>" );
										console.log( twitter_user );

										if ( error )
											throw new Error( error );

										console.log( "Finding User [%s]", twitter_user._id );

										User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

											console.log( "user >>" );
											console.log( user );

											if ( error )
												throw new Error( error );

											if ( user === null ) {

												console.log( "User does not exist, creating" );

												new User( {
													join_date: new Date(),
													twitter_user: twitter_user._id,
												}).save( function( error ){

													if ( error )
														throw new Error( error );

													console.log( "Created New User" );

												});
											}
											else {
												console.log( "User Found" );
											}

										});

									});
								}
								else {
									console.log( "TwitterUser found >>" )
									console.log( twitter_user );
								}
							}
						);
						res.send( "Authentication Successful" );
						// res.redirect('/'); // You might actually want to redirect!
					}
				}
			);
		}
		else {
			res.redirect( "/login" ); // Redirect to login page
		}

	}
);


module.exports = router;