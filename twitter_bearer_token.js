var OAuth2 = require( "OAuth" ).OAuth2;
var env = require( "node-env-file" );
env( ".env" );

var oauth2 = new OAuth2(
	process.env.TWITTER_CONSUMER_KEY,
	process.env.TWITTER_CONSUMER_SECRET,
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
		console.log( "Twitter Bearer Token: "+ access_token );
	}
);