const User = require( "../model/user" );
const TwitterUser = require( "../model/twitter_user" );

const getAccountFromTwitterID = function( twitter_user_twitter_id, return_full ) {

	return new Promise( ( resolve, reject ) => {

		let fields = ( return_full ) ? null : [ "name", "settings", "state" ] ;

		TwitterUser.findOne( { "data.id_str": twitter_user_twitter_id } ).lean()
			.then( ( twitter_user ) => {

				if ( ! twitter_user )
					throw new Error( "twitter_user not found" );

				return User.findOne( { twitter_user: twitter_user._id }, fields );
			})
			.then( ( user ) => {

				if ( ! user )
					throw new Error( "user not found" );

				resolve( user );
			})
			.catch( ( error ) => {
				reject( error );
			});
		
	});

};

const updateAccount = function( twitter_user_twitter_id, settings ) {

	return new Promise( ( resolve, reject ) => {

		getAccountFromTwitterID( twitter_user_twitter_id )
			.then( ( user ) => {
				settings.forEach( ( setting ) => {
					user.settings[ setting.category ][ setting.option ] = setting.value;
				})
				return user.save();
			})
			.then( ( user ) => {
				resolve( user );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

const deleteAccount = function( twitter_user_twitter_id ) {

	return new Promise( ( resolve, reject ) => {

		getAccountFromTwitterID( twitter_user_twitter_id )
			.then( ( user ) => {
				user.remove()
					.then( () => {
						resolve();
					})
					.catch( ( error ) => {
						throw error;
					});
			})
			.catch( ( error ) => {
				reject( error );
			});
		
	});

};


module.exports.getAccountFromTwitterID = getAccountFromTwitterID;
module.exports.updateAccount = updateAccount;
module.exports.deleteAccount = deleteAccount;