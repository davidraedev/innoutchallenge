var fs = require( "fs" );
var csv = require( "csv-parse/lib/sync" );

var Tweet = require( "../model/tweet" );
var Receipt = require( "../model/receipt" );
var User = require( "../model/user" );
var env = require( "node-env-file" );
var TwitterUser = require( "../model/twitter_user" );
//var db = require( "../app/db" );
env( ".env" );

var receipt_controller = require( "../controller/receipt" );
/*
db.connect(function( error ){
	if ( error )
		throw new Error( error );
});
*/

var users = {};

fs.readFile( "data/old_site/users_old.csv", ( error, data_string ) => {
	if ( error )
		throw error;

	var data = csv( data_string, { columns: true } );
	var remaining = data.length;
	data.forEach( ( row ) => {
		
		receipt_controller.get_user_from_twitter_id( {
			user : {
				id_str: row.user_id
			}
		}, ( error, user, twitter_user ) => {

			if ( error )
				throw error;

			if ( ( ! twitter_user.oauth_token || ! twitter_user.oauth_secret ) && ( row.oauthtoken && row.oauthtokensecret ) ) {
				twitter_user.oauth_token = row.oauthtoken;
				twitter_user.oauth_secret = row.oauthtokensecret;
				twitter_user.save( ( error ) => {
					if ( error )
						throw error;
				});
			}

			if ( --remaining === 0 )
				import_tweets();
		});
	});
});

function import_tweets() {
	fs.readFile( "data/old_site/tweets_old.csv", ( error, data_string ) => {
		if ( error )
			throw error;

		var data = csv( data_string, { columns: true } );
		var i = 0;
		data.forEach( ( row ) => {
			setTimeout( () => {
				console.log( row )
				Tweet.findOne(
					{ "data.id_str": row.tweet_id },
					( error, tweet ) => {

						if ( error )
							throw new Error( error );

						if ( tweet === null ) {

							let tweet_data = {
								id_str: row.tweet_id,
								text: row.tweet_text,
								user: {
									id_str: row.user_id,
								}
							};

							new Tweet( { data: tweet_data, source: "old_site", refresh: true } ).save( ( error, tweet ) => {
								
								if ( error ) 
									throw error;

								if ( row.receipt && row.approved == 1 ) {

									receipt_controller.get_user_from_twitter_id( {
										user: {
											id_str: row.user_id
										}
									}, ( error, user, twitter_user ) => {

										if ( error )
											throw error;

										var receipt = new Receipt( {
											number: row.receipt,
											date: new Date( row.tweet_date ),
											tweet: tweet._id,
											user: user._id,
											type: "oldsite",
										}).save( ( error ) => {
											if ( error )
												throw error;
										});
									});
								}
							});
						}
					}
				);
			}, ( i++ * 40 ));
		});
	});
}