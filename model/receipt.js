var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var ReceiptSchema = new Schema({
	number: Number,
	date: Date,
	store: { type: ObjectId, ref: "Store" },
	tweet: { type: ObjectId, ref: "Tweet" },
	user: { type: ObjectId, ref: "User" },
	approved: { type: Number, default: 0 },
	/*
		0: not yet approved,
		1: approved,
		5: admin ignored
	*/
	type: { type: Number, default: 0 },
	/*
		0: unknown
		1: in-store,
		2: drive-thru,
		3: popup
	*/
});

module.exports = mongoose.model( "Receipt", ReceiptSchema );