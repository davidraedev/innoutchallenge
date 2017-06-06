var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	// filled with raw twitter Tweet object
	parsed: { type: Boolean, default: false },
	flagged: { type: Boolean, default: false },
	refresh: { type: Boolean, default: false },
	source: { type: String, default: "" },
}, { strict: false } );

module.exports = mongoose.model( "Tweet", TweetSchema );//TweetSchema;