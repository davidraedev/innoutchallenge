var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	twitter_oauth_token: { type: String, default: null },
	twitter_oauth_secret: { type: String, default: null },
	location_id: Number,
	user_id: Number,
});

module.exports = mongoose.model( "User", UserSchema );