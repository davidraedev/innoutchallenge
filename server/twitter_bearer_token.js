var OAuth2 = require( "OAuth" ).OAuth2;
require( "dotenv" ).config();

var oauth2 = new OAuth2(
	process.env.TWITTER_CONSUMER_KEY_ADMIN,
	process.env.TWITTER_CONSUMER_SECRET_ADMIN,
	"https://api.twitter.com/",
	null,
	"oauth2/token",
	null
);

oauth2.getOAuthAccessToken( "", {
		"grant_type": "client_credentials"
	}, function ( error, access_token ) {
		if ( error )
			throw new Error( error );
		console.log( "Twitter Bearer Token: ["+ access_token  +"]" );
	}
);
