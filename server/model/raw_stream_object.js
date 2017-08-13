var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var RawStreamObjectSchema = new Schema({
	date: { type: Date, default: new Date() },
	data: Schema.Types.Mixed,
	bundle: Number,
});

module.exports = mongoose.model( "RawStreamObject", RawStreamObjectSchema );