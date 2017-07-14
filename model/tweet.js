var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	parsed: { type: Boolean, default: false },
	fetched: { type: Boolean, default: false },
	fetch_date: { type: Date, default: null },
	missing: { type: Boolean, default: false },
	source: { type: Number, default: null },
	/*
		0: old_site,
		1: twitter_search,
		2: twitter_auth,
		3: manual
	*/
	data: Schema.Types.Mixed,
});

module.exports = mongoose.model( "Tweet", TweetSchema );