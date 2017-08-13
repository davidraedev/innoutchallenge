const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const ReceiptSchema = new Schema({
	number: { type: Number, required: true },
	date: { type: Date, required: true },
	store: { type: ObjectId, ref: "Store" },
	tweet: { type: ObjectId, ref: "Tweet" },
	user: { type: ObjectId, ref: "User" },
	approved: { type: Number, default: 0, min: 0, max: 5 },
	/*
		0: not yet approved,
		1: approved,
		2: auto approved, ( for accounts in good standing )
		5: admin ignored
	*/
	type: { type: Number, default: 0, min: 0, max: 4 },
	/*
		0: unknown
		1: in-store,
		2: drive-thru,
		3: popup
		4: test
	*/
});

module.exports = mongoose.model( "Receipt", ReceiptSchema );