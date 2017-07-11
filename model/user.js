var mongoose = require( "mongoose" );
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

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
	totals: Mixed,
});

module.exports = mongoose.model( "User", UserSchema );