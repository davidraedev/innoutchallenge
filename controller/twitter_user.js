var Twitter = require( "twitter" );
var TwitterUser = require( "../model/twitter_user" );
var User = require( "../model/user" );
var env = require( "node-env-file" );
var db = require( "../app/db" );
env( ".env" );

db.connect( function( error ) {
	if ( error )
		throw error;
});

// need to add in rate limiting

// this won't exit immediately if it error in the foreach, it'll continue the loop
var refresh_user = function( twitter_user, callback ) {

	User.findOne( { twitter_user: twitter_user._id }, function( error, user ) {

		if ( error )
			throw error;

		if ( user === null )
			return console.log( "no user found matching that twitter user" );

		if ( twitter_user.oauth_token && twitter_user.oauth_secret ) {
			console.log( "using saved twitter user credentials" );
			var client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
				access_token_key: twitter_user.oauth_token,
				access_token_secret: twitter_user.oauth_secret,
			});
		}
		else {
			console.log( "no user credentials found, using app bearer token" );
			var client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
				bearer_token: process.env.TWITTER_BEARER_TOKEN,
			});
		}

		client.get( "users/show", { user_id: twitter_user.data.id_str }, function( error, twitter_user_object, response ) {

			if ( error )
				return callback( error );

			console.log( "twitter_user_object" );
			console.log( twitter_user_object );

			twitter_user.data = twitter_user_object;
			twitter_user.last_update = new Date();
			twitter_user.not_found = false;
			twitter_user.save( function( error ){

				if ( error )
					throw new Error( error );

				console.log( "successfully updated twitter user" );

			});

		});

	});

};

module.exports = {
	refresh_user: refresh_user,
};