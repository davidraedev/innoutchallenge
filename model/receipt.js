const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const ReceiptSchema = new Schema({
	number: Number,
	date: Date,
	store: { type: ObjectId, ref: "Store" },
	tweet: { type: ObjectId, ref: "Tweet" },
	user: { type: ObjectId, ref: "User" },
	approved: { type: Number, default: 0 },
	/*
		0: not yet approved,
		1: approved,
		2: auto approved, ( for accounts in good standing )
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