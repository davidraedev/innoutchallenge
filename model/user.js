var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new Schema({
	join_date: Date,
	twitter_user: ObjectId,
});

module.exports = mongoose.model( "User", UserSchema );