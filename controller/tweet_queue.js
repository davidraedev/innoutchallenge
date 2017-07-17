const TweetQueue = require( "../model/tweet_queue" );

const addTweetToQueue = function( params, user_id, type, wait_until ) {

	return new Promise( ( resolve, reject ) => {

		let queue = new TweetQueue();
		queue.params = params;
		queue.user = user_id;

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

const fetchTweetQueue = function( limit ) {

	return new Promise( ( resolve, reject ) => {

		limit = limit || 1;

		TweetQueue.find( {}, null, { limit: limit }, ( error, queue ) => {

			if ( error )
				return reject( error );

			return resolve( queue );

		});
	});

};

const findQueue = function( query ) {

	return new Promise( ( resolve, reject ) => {

		TweetQueue.findOne( query, ( error, tweet_queue ) => {

			if ( error )
				return reject( error );

			resolve( tweet_queue );

		});
	});
};

const findQueues = function( query ) {

	return new Promise( ( resolve, reject ) => {

		TweetQueue.find( query, ( error, tweet_queues ) => {

			if ( error )
				return reject( error );

			resolve( tweet_queues );

		});
	});
};

module.exports.addTweetToQueue = addTweetToQueue;
module.exports.fetchTweetQueue = fetchTweetQueue;
module.exports.findQueue = findQueue;
module.exports.findQueues = findQueues;