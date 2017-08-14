const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;

const AppSchema = new Schema({
	store_fetch_date: Date,
});

module.exports = mongoose.model( "App", AppSchema );