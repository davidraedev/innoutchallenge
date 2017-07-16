const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;
const ObjectId = Schema.Types.ObjectId;

const TweetQueueSchema = new Schema({
	add_date: { type: Date, default: new Date() },
	send_date: { type: Date, default: new Date() },
	user: { type: ObjectId, default: null },
	type: { type: Number, default: 0 },
	/*
		0: unknown (no-op)
		1: new user
		2: new receipt
	*/
	params: { type: Mixed, default: null },
	done: { type: Boolean, default: false },
	failed: { type: Boolean, default: false },
	fail_date: { type: Date, default: null },
	fail_retries: { type: Number, default: 0 },
});

module.exports = mongoose.model( "TweetQueue", TweetQueueSchema );