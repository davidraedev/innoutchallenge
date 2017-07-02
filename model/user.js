var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new Schema({
	name: String,
	join_date: Date,
	twitter_user: ObjectId,
	state: { type: Number, default: 0 },
	/*
		0 = not approved
		1 = approved
		2 = banned / removed
	*/
});

module.exports = mongoose.model( "User", UserSchema );