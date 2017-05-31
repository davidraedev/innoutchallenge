var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var TwitterUserSchema = new Schema({
	oauth_token: { type: String, default: null },
	oauth_secret: { type: String, default: null },
	user: Schema.Types.Mixed,
});

module.exports = mongoose.model( "TwitterUser", TwitterUserSchema );//TwitterUserSchema;