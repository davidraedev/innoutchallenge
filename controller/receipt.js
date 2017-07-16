const Receipt = require( "../model/receipt" );

const createReceipt = function( receipt_data ) {

	return new Promise( ( resolve, reject ) => {

		let data = {};
		data.number = receipt_data.number;
		data.user = receipt_data.user;
		data.type = receipt_data.type;

		if ( receipt_data.date )
			data.date = receipt_data.date;

		if ( receipt_data.store )
			data.store = receipt_data.store;

		if ( receipt_data.approved )
			data.approved = receipt_data.approved;

		Receipt.create( data, ( error, receipt ) => {

			if ( error )
				return reject( error );

			return resolve( receipt );

		});

	});
};

const findReceipts = function( query ) {

	return new Promise( ( resolve, reject ) => {
		
		Receipt.find( query, ( error, receipts ) => {

			if ( error )
				return reject( error );

			resolve( receipts );

		});
	});
};

const findReceipt = function( query ) {

	return new Promise( ( resolve, reject ) => {

		Receipt.findOne( query, ( error, receipt ) => {

			if ( error )
				return reject( error );

			resolve( receipt );

		});
	});
};

const findOrCreateReceipt = function( query, data ) {

	return new Promise( ( resolve, reject ) => {

		findReceipt( query )
			.then( ( receipt ) => {
				if ( ! receipt )
					return createReceipt( data );
				return receipt;
			})
			.then( ( receipt ) => {
				resolve( receipt );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};


module.exports = {
	createReceipt: createReceipt,
	findReceipt: findReceipt,
	findReceipts: findReceipts,
	findOrCreateReceipt: findOrCreateReceipt,
};