var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	twitter_oauth_token: { type: String, default: null },
	twitter_oauth_secret: { type: String, default: null },
	join_date: Date,
	twitter_user: [{
		twitter_oauth_token: { type: String, default: null },
		twitter_oauth_secret: { type: String, default: null },
		twitter_user: Mixed/*{
			created_at: Date,
			default_profile: Boolean,
			default_profile_image: Boolean,
			description: { type: String, default: null },
			favourites_count: Number,
			followers_count: Number,
			friends_count: Number,
			geo_enabled: Boolean,
			id_str: String,
			is_translator: Boolean,
			lang: String,
			listed_count: Number,
			location: { type: String, default: null },
			name: String,
			profile_image_url_https: String,
			profile_banner_url: String,
			protected: Boolean,
			screen_name: String,
			statuses_count: Number,
			time_zone: { type: String, default: null },
			url: { type: String, default: null },
			utc_offset: { type: Number, default: null },
			verified: Boolean,
			withheld_in_countries: { type: String, default: null },
			withheld_scope: { type: String, default: null },
		}*/,
	}],
	tweets: [{
		tweet: Mixed/*{
			coordinates: { 
				coordinates: { type: [ Number ], default: null },
				type: String,
				created_at: Date,
				entities: Mixed,
				favorite_count: Number,
				filter_level: String,
				id_str: String,

			},
		}*/,
		parsed: Date,
	}],
	receipts: [{
		number: Number,
		date: Date,
		store: { type: Schema.ObjectId, ref: "Store", default: null },
		tweet: { type: String, default: null },
	}],
});

module.exports = mongoose.model( "User", UserSchema );