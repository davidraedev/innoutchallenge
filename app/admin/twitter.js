var db = require( "../db" );
var TwitterUser = require( "../../model/twitter_user" );
var controller = require( "../../controller/admin" );

console.log( "twitter.js" )

db.connect().then( () => {
	console.log( "twitter.js a" )

	TwitterUser.findOne( { "data.screen_name": "genericwinner" }, ( error, twitter_user ) => {
		console.log( "twitter.js b" )

		if ( error )
			throw error;
		console.log( "twitter.jd c" )
 
		if ( ! twitter_user )
			throw new Error( "No TwitterUser found." )
		console.log( "twitter.js d" )

		let tweet = {
			status: "Test Tweet!",
		};
		console.log( "twitter.js e" )

		controller.send_tweet( twitter_user, tweet )
			.then( ( returned_tweet ) => {
				console.log( "Tweet Sent >>", returned_tweet );
				db.close();
			}).catch( ( error ) => {
				console.error( error );
				db.close();
			});
			console.log( "twitter.js f" )

	});

});