var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var PopupSchema = new Schema({
	date_start: { type: Date, default: null },
	date_end: { type: Date, default: null },
});

module.exports = mongoose.model( "Popup", PopupSchema );