const TweetQueue = require( "../model/tweet_queue" );

const addTweetToQueue = function( params, wait_until ) {

	return new Promise( ( resolve, reject ) => {

		let queue = new TweetQueue();
		queue.params = params;

		if ( wait_until )
			queue.send_date = wait_until;

		queue.save( ( error ) => {
			if ( error )
				return reject( error );
			resolve( queue );
		});

	});

};

module.exports = {
	addTweetToQueue: addTweetToQueue,
};