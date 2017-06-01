var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TwitterUserSchema = new Schema({
	oauth_token: { type: String, default: null },
	oauth_secret: { type: String, default: null },
	last_update: { type: Date, default: new Date( "1900-01-01" ) },
	data: Schema.Types.Mixed,
});

module.exports = mongoose.model( "TwitterUser", TwitterUserSchema );//TwitterUserSchema;