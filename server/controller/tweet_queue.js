require( "dotenv" ).config( { path: process.env.ENV_PATH } );

const tweetController = require( "./tweet" );

const TweetQueue = require( "../model/tweet_queue" );
const TwitterUser = require( "../model/twitter_user" );

const addTweetToQueue = function( params, user_id, type, wait_until, message_type ) {

	return new Promise( ( resolve, reject ) => {

		let queue = new TweetQueue();
		queue.params = params;
		queue.user = user_id;
		queue.message_type = message_type;

		if ( type )
			queue.type = type;

		if ( wait_until )
			queue.send_date = wait_until;

		queue.save( ( error ) => {
			if ( error )
				return reject( error );
			resolve( queue );
		});

	});

};

const findQueue = function( query ) {

	query = query || {};

	return new Promise( ( resolve, reject ) => {

		TweetQueue.findOne( query ).sort( { add_date: "asc" })
			.then( ( tweet_queue ) => {
				resolve( tweet_queue );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

const findQueues = function( query, limit ) {

	query = query || { done: false, failed: false };
	limit = limit || 0;

	return new Promise( ( resolve, reject ) => {

		TweetQueue.find( query ).sort( { add_date: "asc" }).limit( limit )
			.then( ( tweet_queues ) => {
				resolve( tweet_queues );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

const processQueue = function( queue ) {
	
	return new Promise( ( resolve, reject ) => {

		let twitter_user_id;
		if ( queue.type === 1 )
			twitter_user_id = process.env.NEW_RECEIPT_TWEET_USER_ID;
		else if ( queue.type === 2 )
			twitter_user_id = process.env.NEW_DRIVE_THRU_TWEET_USER_ID;
		else
			return reject( "invalid type" );

		TwitterUser.findOne( { "data.id_str": twitter_user_id } )
			.then( ( twitter_user ) => {

				if ( ! twitter_user )
					throw new Error( "twitter_user not found" );

				if ( queue.message_type === 1 )
					return tweetController.sendTweet( twitter_user, queue.params );
				else if ( queue.message_type === 2 )
					return tweetController.sendDM( twitter_user, queue.params );
				else
					throw new Error( "invalid message_type" );

			})
			.then( () => {

				queue.send_date = new Date();
				queue.done = true;
				if ( queue.failed )
					queue.fail_retries++;
				return queue.save();
			})
			.then( () => {
				resolve();
			})
			.catch( ( error ) => {
				console.log( error );

				queue.failed = true;
				queue.fail_date = new Date();
				queue.save()
					.then( () => {
						reject( error );
					})
					.catch( ( error ) => {
						reject( error );
					});
			});
	});
};

const processQueues = function( limit ) {
	
	return new Promise( ( resolve, reject ) => {

		findQueues( null, limit )
			.then( ( queues ) => {
				console.log( "queues", queues )

				if ( ! queues.length )
					return resolve();

				let remaining = queues.length;
				queues.forEach( ( queue ) => {
					console.log( "queue", queue )

					processQueue( queue )
						.then( () => {
							if ( --remaining === 0 )
								return resolve();
						})
						.catch( ( error ) => {
							throw error;
						});

				});
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

module.exports.addTweetToQueue = addTweetToQueue;
module.exports.findQueue = findQueue;
module.exports.findQueues = findQueues;
module.exports.processQueues = processQueues;