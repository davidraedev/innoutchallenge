var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TwitterPlaceSchema = new Schema({
	last_update: { type: Date, default: new Date( "1900-01-01" ) },
	data: Schema.Types.Mixed,
});

module.exports = mongoose.model( "TwitterPlace", TwitterPlaceSchema );