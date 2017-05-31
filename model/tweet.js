var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	// filled with raw twitter Tweet object
	parsed: { type: Boolean, default: false },
}, { strict: false } );

module.exports = mongoose.model( "Tweet", TweetSchema );//TweetSchema;