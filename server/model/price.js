const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const PriceSchema = new Schema({

	user: { type: ObjectId },
	store: { type: ObjectId },
	date: { type: Date },
	burgers: {
		double_double: { type: Number, default: null },
		cheeseburger: { type: Number, default: null },
		hamburger: { type: Number, default: null },
		french_fries: { type: Number, default: null },
	},
	sodas: {
		small: { type: Number, default: null },
		medium: { type: Number, default: null },
		large: { type: Number, default: null },
		xlarge: { type: Number, default: null },
	},
	other_drinks: {
		shake: { type: Number, default: null },
		milk: { type: Number, default: null },
		coffee: { type: Number, default: null },
		cocoa: { type: Number, default: null },
	},
	tax: { type: Number, default: null },
	other: { type: Array, default: [] },

});

module.exports = mongoose.model( "Price", PriceSchema );