var controller = require( "../../controller/twitter_user" );

var TwitterUser = require( "../../model/twitter_user" );
var five_days_ago = new Date();
five_days_ago.setDate( five_days_ago.getDate() - 5 );
TwitterUser.find( { last_update: { $lt: five_days_ago }, not_found: false, suspended: false }, function( error, twitter_users ){

	if ( error )
		throw new Error( error );

	console.log( twitter_users );
	twitter_users.forEach( ( twitter_user, index ) => {

		setTimeout( () => {

			console.log( "twitter_user >>" )
			console.log( twitter_user )

			controller.refresh_user( twitter_user, ( error ) => {
				if ( error ) {
					if ( error[0].code === 50 ) {
						twitter_user.not_found = true;
						twitter_user.last_update = new Date();
						twitter_user.save( ( error ) => {
							if ( error )
								throw error;
						});
						return;
					}
					if ( error[0].code === 63 ) {
						twitter_user.suspended = true;
						twitter_user.last_update = new Date();
						twitter_user.save( ( error ) => {
							if ( error )
								throw error;
						});
						return;
					}
					else {
						console.error( error );
						throw new Error( "Failed to refresh twitter_user" );
					}
				}
				console.log( "Success!" );
			});

		}, ( index * 5000 ));

	});
});//.limit( 10 );
