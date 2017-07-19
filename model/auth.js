const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const AuthSchema = new Schema({
	token: String,
	expires: Date,
	user: { type: ObjectId, ref: "User" },
});

module.exports = mongoose.model( "Auth", AuthSchema );