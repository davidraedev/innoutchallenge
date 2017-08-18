const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;
const ObjectId = Schema.Types.ObjectId;

const TweetQueueSchema = new Schema({
	add_date: { type: Date, default: new Date() },
	send_date: { type: Date, default: new Date() },
	user: { type: ObjectId, default: null },
	/*
		0: unknown (no-op)
		1: new user
		2: new receipt
	*/
	type: { type: Number, default: 0 },
	/*
		1: tweet
		2: dm
	*/
	message_type: { type: Number, default: 0 },
	/*
		the straight tweet params we pass to twitter
	*/
	params: { type: Mixed, default: null },
	done: { type: Boolean, default: false },
	failed: { type: Boolean, default: false },
	error_list: { type: Array, default: [] },
});

module.exports = mongoose.model( "TweetQueue", TweetQueueSchema );