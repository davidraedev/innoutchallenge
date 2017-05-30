var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var HoursSchema = new Schema({
	start: Number,
	end: Number,
	manual: { type: Boolean, default: false },
	checked: { type: Boolean, default: false },
});

module.exports = HoursSchema;