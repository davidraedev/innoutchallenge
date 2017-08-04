var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TwitterUserSchema = new Schema({
	oauth_token: { type: String, default: null },
	oauth_secret: { type: String, default: null },
	oauth_token_admin: { type: String, default: null },
	oauth_secret_admin: { type: String, default: null },
	last_update: { type: Date, default: new Date( "1900-01-01" ) },
	data: Schema.Types.Mixed,
	state: { type: Number, default: 1 },
	/*
		0 = unknown
		1 = normal
		2 = banned
		3 = deactivated
	*/
});

module.exports = mongoose.model( "TwitterUser", TwitterUserSchema );