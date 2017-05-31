var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

//var Tweet = require( "./tweet" );
//var Receipt = require( "./receipt" );
//var TwitterUser = require( "./twitter_user" );
var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new Schema({
	join_date: Date,
	tweets: [ ObjectId ],
	receipts: [ ObjectId ],
	twitter_user: [ ObjectId ],
});

module.exports = mongoose.model( "User", UserSchema );