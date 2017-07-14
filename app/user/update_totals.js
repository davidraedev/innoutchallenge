var db = require( "../db" );
var User = require( "../../model/user" );
var Receipt = require( "../../model/receipt" );
var Store = require( "../../model/store" );

const ObjectId = require( "mongoose" ).Types.ObjectId;

function updateUserTotals( user, callback ) {

	let totals = {
		receipts: {
			unique: 0,
			total: 0,
			remaining: 98,
		},
		drivethru: {
			unique: 0,
			total: 0,
			remaining: 999,
		},
		stores: {
			unique: 0,
			total: 0,
		},
		popups: {
			total: 0
		}
	};


	// in-storea and drivethru totals
	Receipt.find( { user: new ObjectId( user._id ), type: { $in: [ 1, 2 ] }, approved: 1 }, ( error, receipts ) => {
		console.log( "user receipts" );

		if ( error )
			throw error;

		if ( ! receipts.length ) {
			console.log( "no receipts found [%s]", user.name );
			return;
		}

		let receipts_list = {};
		let drive_thru_list = {};
		for ( let i = 1; i <= 99; i++ ) {
			if ( i !== 69 )
				receipts_list[ i ] = { amount: 0 };
		}

		receipts.forEach( ( receipt ) => {

			// in_store
			if ( receipt.type === 1 ) {
			
				if ( receipts_list[ receipt.number ].amount === 0 ) {
					totals.receipts.unique++;
					totals.receipts.remaining--;
				}
				totals.receipts.total++;
				receipts_list[ receipt.number ].amount++;

			}

			// drive_thru
			if ( receipt.type === 2 ) {
			
				if ( ! drive_thru_list[ receipt.number ] ) {
					drive_thru_list[ receipt.number ] = { amount: 0 };
					totals.drivethru.unique++;
					totals.drivethru.remaining--;
				}
				totals.drivethru.total++;
				drive_thru_list[ receipt.number ].amount++;

			}

		});

	});


	// store and popup totals
	Store.find({}, ( error, stores ) => {

		if ( error )
			throw error;

		if ( ! stores.length ) {
			console.log( "No Stores found" );
			return;
		}

		totals.stores.remaining = stores.length;

		let stores_list = {};
		stores.forEach( ( store ) => {
			stores_list[ store._id ] = { amount: 0 };
		});

		// if we vet our data input correctly, we can take out the store/popup check and rely only on the { type } check
		Receipt.find( { user: new ObjectId( user._id ), approved: 1, store: { $ne: null }, type: { $in: [ 1, 2, 3 ] } }, ( error, receipts ) => {

			if ( error )
				throw error;

			// for some odd reason, straight up "==" matching the ids was not working, so had to add this beast in 
			function charMatch( stra, strb ) {
				if ( stra.length != strb.length )
					return false;
				for ( let i = 0; i < stra.length; i++ )
					if ( stra.charCodeAt( i ) !== strb.charCodeAt( i ) )
						return false;
				return true;
			}

			function getStore( id ) {
				let store = false;
				stores.some( ( temp_store ) => {
					console.log( temp_store._id +" == "+ id );
					if ( charMatch( temp_store._id, id ) ) {
						store = temp_store;
						return true;
					}
				});
				return store;
			}

			receipts.forEach( ( receipt ) => {

				// popups
				if ( receipt.popup ) {
					totals.popups.total++;
				}

				// stores
				else {
					console.log( "store >> [%s]", stores_list[ receipt.store ] );

					if ( stores_list[ receipt.store ].amount === 0 ) {
						totals.stores.unique++;
						totals.stores.remaining--;
					}

					totals.stores.total++;
					stores_list[ receipt.store ].amount++;
				}

			});

			user.totals = totals;
			user.save( ( error ) => {
				if ( error )
					throw error;
				if ( typeof callback === "function" )
					callback();
			});

		}).lean();

	}).lean();
}

function updateAllUsersTotals() {

	User.find( { state: 1 }, ( error, users ) => {

		if ( error )
			throw error;

		if ( ! users.length ) {
			console.log( "no users to update" );
			return;
		}

		let users_remaining = users.length;

		users.forEach( ( user ) => {
			
			updateUserTotals( user, () => {
				if ( --users_remaining === 0 )
					db.close();
			});

		});
	});
}

db.connect().then( () => {

	updateAllUsersTotals();
/*
	User.findOne({ name: "stuballew" }, ( error, user ) => {
		
		if ( error )
			throw error;

		if ( ! user )
			throw new Error( "Could not find user" );

		updateUserTotals( user, () => {
			db.close();
		});
	});
*/
});