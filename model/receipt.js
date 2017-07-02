var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var ReceiptSchema = new Schema({
	number: Number,
	date: Date,
	location: ObjectId,
	tweet: ObjectId,
	user: ObjectId,
	approved: { type: Number, default: 0 },
	/*
		0: not yet approved,
		1: approved,
		5: admin ignored
	*/
});

module.exports = mongoose.model( "Receipt", ReceiptSchema );//ReceiptSchema;