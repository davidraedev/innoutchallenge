var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	parsed: { type: Boolean, default: false },
	fetched: { type: Boolean, default: false },
	fetch_date: { type: Date, default: null },
	missing: { type: Boolean, default: false },
	source: { type: String, default: "" },
	/*
		old_site,
		twitter_search,
		twitter_auth,
		manual
	*/
	data: Schema.Types.Mixed,
});

module.exports = mongoose.model( "Tweet", TweetSchema );