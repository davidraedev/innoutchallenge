const Twitter = require( "twitter-request-queue-node" );
const TwitterUser = require( "../model/twitter_user" );
const User = require( "../model/user" );
const PromiseEndError = require( "../app/error/PromiseEndError" );
require( "dotenv" ).config( process.env.ENV_PATH );

const update_user_older_than_days = 0.00001;

function updateTwitterUser( twitter_user, data ) {
	twitter_user.data = data;
	twitter_user.last_update = new Date();
	return twitter_user.save();
}

const refresh_user = function( user, callback ) {

	TwitterUser.findOne( { _id: user.twitter_user }, function( error, twitter_user ) {

		if ( error )
			throw error;

		if ( twitter_user === null )
			throw new Error( "Failed to find Twitter user ["+ user.twitter_user + "]" );

		let client_params = {
			consumer_key: process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		};

		if ( twitter_user.oauth_token && twitter_user.oauth_secret ) {
			client_params.access_token_key = twitter_user.oauth_token;
			client_params.access_token_secret = twitter_user.oauth_secret;
		}
		else {
			client_params.bearer_token = process.env.TWITTER_BEARER_TOKEN;
		}

		let client = new Twitter( client_params );

		client.get( "users/show", { user_id: twitter_user.data.id_str }, function( error, twitter_user_object ) {

			if ( error )
				return callback( error );

			updateTwitterUser( twitter_user, twitter_user_object )
				.catch( ( error ) => {
					throw error;
				});
		});
	});
};

const createTwitterUser = function( user_data ) {

	return new Promise( ( resolve, reject ) => {

		let data = {};
		data.data = {};
		data.data.id_str = user_data.twitter_id;
		data.data.screen_name = user_data.screen_name;

		if ( user_data.oauth_token )
			data.oauth_token = user_data.oauth_token;

		if ( user_data.oauth_secret )
			data.oauth_secret = user_data.oauth_secret;

		if ( user_data.last_update )
			data.last_update = user_data.last_update;

		TwitterUser.create( data, ( error, twitter_user ) => {

			if ( error )
				return reject( error );

			return resolve( twitter_user );

		});

	});
};

const findTwitterUser = function( query, lean ) {

	return new Promise( ( resolve, reject ) => {

		let callback = function( error, twitter_user ) {
			if ( error )
				return reject( error );
			resolve( twitter_user );
		};

		if ( lean )
			TwitterUser.findOne( query, callback ).lean();
		else
			TwitterUser.findOne( query, callback );
	});
};

const findOrCreateTwitterUser = function( query, data ) {

	return new Promise( ( resolve, reject ) => {

		findTwitterUser( query )
			.then( ( twitter_user ) => {
				if ( ! twitter_user )
					return createTwitterUser( data );
				return twitter_user;
			})
			.then( ( twitter_user ) => {
				resolve( twitter_user );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

function getTwitterUsersToUpdate( limit, account_status ) {

	limit = limit || 100;
	account_status = ( isNaN( parseInt( account_status, 10 ) ) ) ? 1 : account_status;

	let older_than = new Date();
		older_than.setDate( older_than.getDate() - update_user_older_than_days );

	return TwitterUser.find({ last_update: { $lt: older_than }, state: account_status }).sort( { last_update: "desc" } ).limit( limit );
}

function getTwitterUsersFromLookupApp ( twitter_user_ids_array ) {

	return new Promise( ( resolve, reject ) => {

		let client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY_USER,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET_USER,
			bearer_token: process.env.TWITTER_BEARER_TOKEN_USER,
		});

		const ids = twitter_user_ids_array.join( "," );

		client.get( "users/lookup", { user_id: ids }, function( error, twitter_users ) {

			if ( error ) {

				if ( error[0].code == 17 ) // twitter errors if all your users are missing/deactivated
					return resolve( [] );

				return reject( error );
			}

			resolve( twitter_users );
		});
	});
}

const updateTwitterUsers = function( limit ) {

	return new Promise( ( resolve, reject ) => {

		let this_twitter_users;
		getTwitterUsersToUpdate( limit, 1 )
			.then( ( twitter_users ) => {

				if ( ! twitter_users.length )
					throw new PromiseEndError( "no twitter_users to update" );

				this_twitter_users = twitter_users;

				return twitter_users;
			})
			.then( ( twitter_users ) => {

				let ids = twitter_users.map( ( twitter_user ) => {
					return twitter_user.data.id_str;
				});

				return ids;
			})
			.then( ( ids ) => {
				return getTwitterUsersFromLookupApp( ids );
			})
			.then( ( twitter_user_objects ) => {

				let remaining_twitter_user_objects = twitter_user_objects.length;

				if ( ! remaining_twitter_user_objects )
					return resolve( "No twitter users returned" );

				twitter_user_objects.forEach( ( twitter_user_object ) => {

					let twitter_user;
					let twitter_user_index;
					let stop;
					this_twitter_users.forEach( ( this_twitter_user, index ) => {

						if ( stop )
							return;

						if ( this_twitter_user.data.id_str == twitter_user_object.id_str ) {
							twitter_user = this_twitter_user;
							twitter_user_index = index;
							stop = true;
						}

					});

					if ( ! stop )
						throw new Error( "no twitter_user match" );

					twitter_user.state = 1;

					updateTwitterUser( twitter_user, twitter_user_object )
						.then( () => {
							return User.findOne( { twitter_user: twitter_user._id } );
						})
						.then( ( user ) => {

							if ( ! user )
								throw new Error( "failed to find user "+ twitter_user._id );

							try {
								user.settings.avatar = twitter_user.data.profile_image_url_https;
							} catch ( error ) {
								console.log( "user", user );
								throw error;
							}
							return user.save();

						})
						.then( () => {

							this_twitter_users[ twitter_user_index ] = null;

							if ( --remaining_twitter_user_objects === 0 ) {

								markTwitterUsersMissing( this_twitter_users.filter( ( twitter_user ) => { return twitter_user !== null; } ) )
									.then( () => {
										resolve();
									})
									.catch( ( error ) => {
										throw error;
									});
							}
						})
						.catch( ( error ) => {
							throw error;
						});
				});
			})
			.catch( ( error ) => {
				if ( error instanceof PromiseEndError )
					return resolve( error );
				reject( error );
			});
	});
};

function markTwitterUserMissing( twitter_user ) {
	twitter_user.state = 0;
	return twitter_user.save();
}

function markTwitterUsersMissing( twitter_users ) {

	return new Promise( ( resolve, reject ) => {

		let remaining = twitter_users.length;

		if ( ! remaining )
			return resolve();

		twitter_users.forEach( ( twitter_user ) => {
			 markTwitterUserMissing( twitter_user )
				 .then( () => {
					if ( --remaining === 0 )
						resolve();
				})
				.catch( ( error ) => {
					reject( error );
				});
		});
	});
}

module.exports.refresh_user = refresh_user;
module.exports.createTwitterUser = createTwitterUser;
module.exports.findTwitterUser = findTwitterUser;
module.exports.findOrCreateTwitterUser = findOrCreateTwitterUser;
module.exports.updateTwitterUsers = updateTwitterUsers;