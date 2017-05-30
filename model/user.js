var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var Tweet = require( "./tweet" );
var Receipt = require( "./receipt" );
var TwitterUser = require( "./twitter_user" );

var UserSchema = new Schema({
	join_date: Date,
	tweets: [ Tweet ],
	receipts: [ Receipt ],
	twitter_user: [ TwitterUser ],
});

module.exports = mongoose.model( "User", UserSchema );