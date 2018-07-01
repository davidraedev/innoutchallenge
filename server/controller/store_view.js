const Store = require( "../model/store" );

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

const listAll = function( request, response ) {

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


module.exports.info = info;
module.exports.list_all = listAll;