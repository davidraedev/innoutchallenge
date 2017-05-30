var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var ReceiptSchema = new Schema({
	number: Number,
	date: Date,
	location: { type: ObjectId, default: null },
	tweet: { type: ObjectId, default: null },
});

module.exports = ReceiptSchema;