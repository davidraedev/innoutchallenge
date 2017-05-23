var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var SiteSchema = new Schema({
	store_update: { type: Date, default: null },
});

module.exports = mongoose.model( "Site", SiteSchema );