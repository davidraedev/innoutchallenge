var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ReceiptSchema = new Schema({
	number: String,
//	tweet_id: String,
	date: Date,
//	location_id: Number,
//	user_id: Number,
});

module.exports = mongoose.model( "Receipt", ReceiptSchema );