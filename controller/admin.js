const Twitter = require( "twitter" );
require( "dotenv" ).config();

const send_tweet = function( twitter_user, tweet ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! twitter_user.oauth_token_admin || ! twitter_user.oauth_secret_admin )
			return reject( "Invalid credentials" );

		let client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY_ADMIN,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET_ADMIN,
			access_token_key: twitter_user.oauth_token_admin,
			access_token_secret: twitter_user.oauth_secret_admin,
		});

		client.post( "statuses/update", tweet, ( error, tweet ) => {

			if ( error )
				return reject( error );

			return resolve( tweet );
		});
	});
};

module.exports = {
	send_tweet: send_tweet,
};