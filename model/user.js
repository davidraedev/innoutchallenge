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
	settings: {
		tweet: {
			unique_numbers: { type: Boolean, default: true },
			milestones: { type: Boolean, default: true }, 
		},
		dm: {
			unique_numbers: { type: Boolean, default: false },
			milestones: { type: Boolean, default: false },
			stores: { type: Boolean, default: false },
			drive_thrus: { type: Boolean, default: false }, 
		},
		avatar: { type: String, default: null },
	},
	totals: Mixed,
});

module.exports = mongoose.model( "User", UserSchema );