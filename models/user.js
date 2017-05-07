var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	twitter_oauth_token: { type: String, default: null },
	twitter_oauth_secret: { type: String, default: null },
	join_date: Date,
	twitter_user: [{
		twitter_oauth_token: { type: String, default: null },
		twitter_oauth_secret: { type: String, default: null },
		twitter_user: Mixed,
	}],
	tweets: [{
		tweet: Mixed,
		parsed: Date,
	}],
	receipts: [{
		number: Number,
		date: Date,
		store: { type: Schema.ObjectId, ref: "Store", default: null },
		tweet: { type: String, default: null },
	}],
});

module.exports = mongoose.model( "User", UserSchema );