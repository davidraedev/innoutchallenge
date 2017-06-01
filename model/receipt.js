var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var ReceiptSchema = new Schema({
	number: Number,
	date: Date,
	location: ObjectId,
	tweet: ObjectId,
	user: ObjectId,
});

module.exports = mongoose.model( "Receipt", ReceiptSchema );//ReceiptSchema;