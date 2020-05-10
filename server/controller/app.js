const App = require( "../model/app" );

const getStoreFetchDate = function() {

	return new Promise( ( resolve, reject ) => {

		App.findOne( {}, [ "store_fetch_date" ])
			.then( ( data ) => {
				if ( ! data )
					return resolve();
				else
					return resolve( data.store_fetch_date );
			})
			.catch( ( error ) => {
				return reject( error );
			});
	});
};

const setStoreFetchDate = function( date ) {

	date = date || new Date();

	return new Promise( ( resolve, reject ) => {

		App.updateOne( {}, { store_fetch_date: date }, { upsert: true } )
			.then( ( data ) => {
				return resolve();
			})
			.catch( ( error ) => {
				return reject( error );
			});
	});
};

module.exports.getStoreFetchDate = getStoreFetchDate;
module.exports.setStoreFetchDate = setStoreFetchDate;