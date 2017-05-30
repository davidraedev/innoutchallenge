var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
	latitude: { type: Number, default: null },
	longitude: { type: Number, default: null },
	address: { type: String, default: null },
	city: { type: String, default: null },
	state: { type: String, default: null },
	zipcode: { type: String, default: null },
	country: { type: String, default: null },
});

module.exports = LocationSchema;