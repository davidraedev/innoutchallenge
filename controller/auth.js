const TwitterUser = require( "../model/twitter_user" );
const User = require( "../model/user" );
const OAuth = require( "oauth" ).OAuth;
require( "dotenv" ).config();

const mongoose = require( "mongoose" );
const ObjectId = mongoose.Schema.Types.ObjectId;
var Twitter = require( "twitter" );

function makeOauth( type ) {

	let oauth_key;
	let oauth_secret;
	let callback_url;

	if ( type == "user" ) {
		oauth_key = process.env.TWITTER_CONSUMER_KEY_USER;
		oauth_secret = process.env.TWITTER_CONSUMER_SECRET_USER;
		callback_url = "http://localhost:3000/auth/twitter/callback";
	}
	else if ( type == "admin" ) {
		oauth_key = process.env.TWITTER_CONSUMER_KEY_ADMIN;
		oauth_secret = process.env.TWITTER_CONSUMER_SECRET_ADMIN;
		callback_url = "http://localhost:3000/admin/auth/twitter/callback";
	}
	else {
		return false;
	}

	return new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		oauth_key,
		oauth_secret,
		"1.0",
		callback_url,
		"HMAC-SHA1"
	);
}

const user_login = function( request, response ) {
	response.render( "login", { login_url: "/auth/twitter" } );
};

const user_login_2 = function( request, response ) {

	let oauth = makeOauth( "user" );

	oauth.getOAuthRequestToken( ( error, oauth_token, oauth_token_secret, results ) => {

		if ( error ) {
			console.log( error );
			response.send( "Authentication Failed!" );
			return;
		}

		request.session.oauth = {
			token: oauth_token,
			token_secret: oauth_token_secret,
		};

		response.redirect( "https://twitter.com/oauth/authenticate?oauth_token=" + oauth_token );
	});
};

const user_login_3 = function( request, response ) {

	let oauth = makeOauth( "user" );

	if ( request.session.oauth ) {
		request.session.oauth.verifier = request.query.oauth_verifier;
		var oauth_data = request.session.oauth;

		oauth.getOAuthAccessToken(
			oauth_data.token,
			oauth_data.token_secret,
			oauth_data.verifier,
			( error, oauth_access_token, oauth_access_token_secret, results ) => {

				if ( error ) {
					console.log( error );
					response.send( "Authentication Failure!" );
				}
				else {

					/*

					{
						user_id: '000000000',
						screen_name: 'test_user',
						x_auth_expires: '0'
					}

					{
						token: 'aaaaaaaaaaaaaaaaaaaa',
						token_secret: 'aaaaaaaaaaaaaaaaaaaa',
						verifier: 'aaaaaaaaaaaaaaaaaaaa',
						access_token: 'aaaaaaaaaaaaaaaaaaaa',
						access_token_secret: 'aaaaaaaaaaaaaaaaaaaa'
					}

					*/

					request.session.oauth.access_token = oauth_access_token;
					request.session.oauth.access_token_secret = oauth_access_token_secret;
					TwitterUser.findOne(
						{ "data.id_str": results.user_id },
						function( error, twitter_user ){

							if ( error )
								throw error;

							if ( twitter_user === null ) {
								new TwitterUser( {
									oauth_token: request.session.oauth.access_token,
									oauth_secret: request.session.oauth.access_token_secret,
									data: {
										id_str: results.user_id,
										screen_name: results.screen_name
									}
								}).save( function( error, twitter_user ){

									if ( error )
										throw error;

									User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

										if ( error )
											throw error;

										if ( user === null ) {

											new User( {
												join_date: new Date(),
												twitter_user: twitter_user._id,
											}).save( function( error ){

												if ( error )
													throw error;

											});
										}

									});

								});
							}
							else {
								twitter_user.oauth_token = request.session.oauth.access_token;
								twitter_user.oauth_secret = request.session.oauth.access_token_secret;
								twitter_user.save( ( error ) => {
									if ( error )
										throw error
								})
							}
						}
					);
					response.send( "Authentication Successful" );
					// response.redirect('/'); // You might actually want to redirect!
				}
			}
		);
	}
	else {
		response.redirect( "/login" );
	}
};

const admin_login = function( request, response ) {
	response.render( "login", { login_url: "/admin/auth/twitter" } );
};

const admin_login_2 = function( request, response ) {

	let oauth = makeOauth( "admin" );

	oauth.getOAuthRequestToken( ( error, oauth_token, oauth_token_secret, results ) => {

		if ( error ) {
			console.log( error );
			response.send( "Authentication Failed!" );
			return;
		}

		request.session.oauth = {
			token: oauth_token,
			token_secret: oauth_token_secret,
		};

		response.redirect( "https://twitter.com/oauth/authenticate?oauth_token=" + oauth_token );
	});
};

const admin_login_3 = function( request, response ) {

	let oauth = makeOauth( "admin" );

	if ( request.session.oauth ) {
		request.session.oauth.verifier = request.query.oauth_verifier;
		var oauth_data = request.session.oauth;

		oauth.getOAuthAccessToken(
			oauth_data.token,
			oauth_data.token_secret,
			oauth_data.verifier,
			( error, oauth_access_token, oauth_access_token_secret, results ) => {

				if ( error ) {
					console.log( error );
					response.send( "Authentication Failure!" );
				}
				else {

					/*

					{
						user_id: '000000000',
						screen_name: 'test_user',
						x_auth_expires: '0'
					}

					{
						token: 'aaaaaaaaaaaaaaaaaaaa',
						token_secret: 'aaaaaaaaaaaaaaaaaaaa',
						verifier: 'aaaaaaaaaaaaaaaaaaaa',
						access_token: 'aaaaaaaaaaaaaaaaaaaa',
						access_token_secret: 'aaaaaaaaaaaaaaaaaaaa'
					}

					*/

					request.session.oauth.access_token = oauth_access_token;
					request.session.oauth.access_token_secret = oauth_access_token_secret;
					TwitterUser.findOne(
						{ "data.id_str": results.user_id },
						function( error, twitter_user ){

							if ( error )
								throw error;

							if ( twitter_user === null ) {
								new TwitterUser( {
									oauth_token_admin: request.session.oauth.access_token,
									oauth_secret_admin: request.session.oauth.access_token_secret,
									data: {
										id_str: results.user_id,
										screen_name: results.screen_name
									}
								}).save( function( error, twitter_user ){

									if ( error )
										throw error;

									User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

										if ( error )
											throw error;

										if ( user === null ) {

											new User( {
												join_date: new Date(),
												twitter_user: twitter_user._id,
											}).save( function( error ){

												if ( error )
													throw error;

											});
										}
							//			else {
							//				console.log( "User Found" );
							//			}

									});

								});
							}
							else {
								twitter_user.oauth_token_admin = request.session.oauth.access_token;
								twitter_user.oauth_secret_admin = request.session.oauth.access_token_secret;
								
								twitter_user.save( ( error ) => {
									if ( error )
										throw error
								})
								
							}
						}
					);
					response.send( "Authentication Successful" );
					// response.redirect('/'); // You might actually want to redirect!
				}
			}
		);
	}
	else {
		response.redirect( "/login" ); // Redirect to login page
	}
};

const admin_test_tweet = function( request, response ) {

	User.find( { "data.screen_name": "genericwinner" }, ( error, user ) => {

		if ( error )
			throw error;

		if ( ! user )
			throw new Error( "No User Found" );

		TwitterUser.find( { "twitter_user": new ObjectId( user._id ) }, ( error, twitter_user ) => {

			if ( error )
				throw error;

			if ( ! twitter_user )
				throw new Error( "No TwitterUser Found" );

			let client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
				bearer_token: process.env.TWITTER_BEARER_TOKEN,
			});

			client.get( "search/tweets", search_params, function( error, tweets ) {

		});

	});

	
};

module.exports = {
	user_login: user_login,
	user_login_2: user_login_2,
	user_login_3: user_login_3,
	admin_login: admin_login,
	admin_login_2: admin_login_2,
	admin_login_3: admin_login_3,

	admin_test_tweet: admin_test_tweet,
};