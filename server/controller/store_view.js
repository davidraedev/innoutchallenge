const Store = require( "../model/store" );

const info = function( request, response ) {

	let number = request.body.number;

	console.log( "number", number )

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


module.exports.info = info;