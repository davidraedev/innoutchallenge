const Store = require( "../model/store" );
const Price = require( "../model/price" );

const info = function( request, response ) {

	let number = request.body.number;

	Store.findOne( { number: number, opened: { $ne: null } } )
		.then( ( store ) => {

			if ( ! store )
				return response.status( 500 ).send({ error: "No Store Found", store: store });

			return response.json( store );

		})
		.catch( ( error ) => {
			response.status( 500 ).send( error );
		});
}

const list_all = function( request, response ) {

	Store.find( { opened: { $ne: null } }, "number" )
		.then( ( stores ) => {

			if ( ! stores.length )
				return response.status( 500 ).send({ error: "No Stores Found" });

			return response.json( stores );

		})
		.catch( ( error ) => {
			response.status( 500 ).send( error );
		});
}

const get_price = function( request, response ) {

	let store = request.body.store || null;
	let search = ( store ) ? { store: store } : {};

	Price.findOne( search, null, { sort: { date: -1 } } )
		.then( ( price ) => {

			return response.json( price | {} );

		})
		.catch( ( error ) => {
			response.status( 500 ).send( error );
		});
}

const save_price = function( request, response ) {

	if ( ! request.body.store )
		return response.status( 500 ).send( "Store not specified" );

	if ( ! request.body.prices )
		return response.status( 500 ).send( "Prices not specified" );

	let { store, prices } = request.body;

	let search = {
		_id: store,
	};
	let data = {
		store: store,
		date: prices.date,
		burgers: {
			double_double: prices.burgers.double_double,
			cheeseburger: prices.burgers.cheeseburger,
			hamburger: prices.burgers.hamburger,
			fries: prices.burgers.fries,
		},
		sodas: {
			small: prices.sodas.small,
			medium: prices.sodas.medium,
			large: prices.sodas.large,
			xlarge: prices.sodas.xlarge,
		},
		other_drinks: {
			shake: prices.other_drinks.shake,
			milk: prices.other_drinks.milk,
			coffee: prices.other_drinks.coffee,
			cocoa: prices.other_drinks.cocoa,
		},
	};

	Store.findOne( search, null, { sort: { date: -1 } } )
		.then( ( store ) => {

			if ( ! store )
				return response.status( 500 ).send( "Store not found" );

			Price.create( data )
				.then( () => {
					return response.json({ success: true });
				});

		})
		.catch( ( error ) => {
			response.status( 500 ).send( error );
		});
}

module.exports.info = info;
module.exports.list_all = list_all;
module.exports.get_price = get_price;
module.exports.save_price = save_price;