var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var StoreSchema = new Schema({
	number: { type: Number, default: null },
	latitude: { type: Number, default: null },
	longitude: { type: Number, default: null },
	address: { type: String, default: null },
	name: { type: String, default: null },
	hours: {
		sunday: { start: Number, end: Number },
		monday: { start: Number, end: Number },
		tuesday: { start: Number, end: Number },
		wednesday: { start: Number, end: Number },
		thursday: { start: Number, end: Number },
		friday: { start: Number, end: Number },
		saturday: { start: Number, end: Number },
	},
	timezone: { type: String, default: null }
});

module.exports = mongoose.model( "Store", StoreSchema );