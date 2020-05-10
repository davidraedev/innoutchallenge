var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	parsed: { type: Boolean, default: false },
	fetched: { type: Boolean, default: false },
	fetch_date: { type: Date, default: null },
	missing: { type: Number, default: 0 },
	/*
		0: not missing,
		1: deleted,
		2: private,
		3: unknown,
	*/
	source: { type: Number, default: null },
	/*
		0: old_site,
		1: twitter_search,
		2: twitter_auth,
		3: manual,
		4: sent_tweet // like when we send welcome / new receipt tweets
	*/
	data: Schema.Types.Mixed,
});

module.exports = mongoose.model( "Tweet", TweetSchema );