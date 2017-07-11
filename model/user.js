var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new Schema({
	name: String,
	join_date: Date,
	twitter_user: { type: ObjectId, ref: "TwitterUser" },
	state: { type: Number, default: 0 },
	/*
		0 = not approved
		1 = approved
		2 = banned
		3 = temp_ignored
	*/
});

module.exports = mongoose.model( "User", UserSchema );