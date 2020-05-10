const store_controller = require( "./store" );
const Store = require( "../model/store" );
const Price = require( "../model/price" );
const path = require( "path" );

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

	Store.find( { opened: { $ne: null } }, "number location" )
		.then( ( stores ) => {

			if ( ! stores.length )
				return response.status( 500 ).json({ error: "No Stores Found" });

			return response.json( stores );

		})
		.catch( ( error ) => {
			response.status( 500 ).json( { error: error } );
		});
}

const get_price = function( request, response ) {

	let store = request.body.store || null;
	let search = ( store ) ? { store: store } : {};

	Price.findOne( search, null, { sort: { date: -1 } } ).lean()
		.then( ( price ) => {
			return response.json( price );
		})
		.catch( ( error ) => {
			response.status( 500 ).json( { error: error.toString() } );
		});
}

const save_price = function( request, response ) {

	if ( ! request.body.store )
		return response.status( 500 ).json( { error: "Store not specified" } );

	if ( ! request.body.prices )
		return response.status( 500 ).json( { error: "Prices not specified" } );

	let user_id = response.locals.user_id || false;

	let { store, prices } = request.body;

	let image = null;
	if ( request.body.image )
		image = request.body.image;

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

	if ( image )
		data.image = image;

	if ( user_id )
		data.user = user_id;

	Store.findOne( search, null, { sort: { date: -1 } } )
		.then( ( store ) => {

			if ( ! store )
				return response.status( 500 ).json( { error: "Store not found" } );

			Price.create( data )
				.then( () => {
					return response.json( { success: true } );
				});

		})
		.catch( ( error ) => {
			response.status( 500 ).json( { error: error } );
		});
}

const closest = function( request, response ) {

	console.log( "request.body", request.body )

	if ( ! request.body.latitude )
		return response.status( 500 ).json( { error: "Latitude not specified" } );

	if ( ! request.body.longitude )
		return response.status( 500 ).json( { error: "Longitude not specified" } );

	let { latitude, longitude } = request.body;

	store_controller.findStoreNearCoords( latitude, longitude, 5000 )
		.then( ( store ) => {

			if ( ! store )
				return response.status( 500 ).json( { error: "Store not found" } );

			return response.json( store );

		})
		.catch( ( error ) => {
			response.status( 500 ).json( { error: error } );
		});
}

const price_map = function( request, response ) {
	response.sendFile( path.resolve( __dirname, "../public/html/price_map.html" ) )
}

const price_map_json = function( request, response ) {
	Store.find({})
		.then( ( stores ) => {

			Promise.all( stores.map( ( store ) => {
					return Price.findOne( { store: store._id }, null, { sort: { date: -1 } } );
				}) )
				.then( ( price_data ) => {

					let data = stores.map( ( store, index ) => {
						return {
							iata: store.number,
							name: store.name,
							city: store.location.city,
							state: store.location.state,
							country: store.location.country,
							latitude: store.location.latitude,
							longitude: store.location.longitude,
							price: price_data[ index ],
						};
					});

					return response.json( data );

				});
		});
}

module.exports.info = info;
module.exports.list_all = list_all;
module.exports.get_price = get_price;
module.exports.save_price = save_price;
module.exports.closest = closest;
module.exports.price_map = price_map;
module.exports.price_map_json = price_map_json;