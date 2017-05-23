var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	join_date: Date,
	twitter_user: [{
		oauth_token: { type: String, default: null },
		oauth_secret: { type: String, default: null },
		user: Schema.Types.Mixed,
	}],
	tweets: [{
		tweet: Schema.Types.Mixed,
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