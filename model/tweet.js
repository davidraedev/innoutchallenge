var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	tweet: Schema.Types.Mixed,
	parsed: Date,
});

module.exports = TweetSchema;