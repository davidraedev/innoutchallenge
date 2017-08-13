import axios from "axios"

/*
{
	type: "FETCH_USER_RECEIPTS_FULFILLED",
	payload: {
		name: String,
		totals: {
			receipts: {
				unique: Number,
				remaining: Number,
				total: Number,
			}
		},
		receipts: receipts,
	}
}
*/
export function fetchUserReceipts( dispatch, name, latest_receipt ) {

	dispatch({ type: "FETCH_USER_RECEIPTS_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/user/receipts", { method: "post", data: { name: name, return_latest_receipt: latest_receipt }, withCredentials: true } )
			.then( ( response ) => {
				dispatch({ type: "FETCH_USER_RECEIPTS_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let data = {
					error: error.response.data,
					status: error.response.status
				}

				dispatch({ type: "FETCH_USER_RECEIPTS_REJECTED", payload: data })
			});
	}
}

export function fetchUserStores( dispatch, name, latest_receipt ) {

	dispatch({ type: "FETCH_USER_STORES_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/user/stores", { method: "post", data: { name: name, return_latest_receipt: latest_receipt }, withCredentials: true } )
			.then( ( response ) => {
				dispatch({ type: "FETCH_USER_STORES_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let message;
				if ( error.response )
					message = "["+ error.response.status +"] "+ error.response.data
				else
					message = error.message;

				dispatch({ type: "FETCH_USER_STORES_REJECTED", payload: { error: message, status: error.response.status || 500 } })
			});
	}
}

export function fetchUserDriveThru( dispatch, name, latest_receipt ) {

	dispatch({ type: "FETCH_USER_DRIVETHRU_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/user/drivethru", { method: "post", data: { name: name, return_latest_receipt: latest_receipt }, withCredentials: true } )
			.then( ( response ) => {
				dispatch({ type: "FETCH_USER_DRIVETHRU_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let message;
				if ( error.response )
					message = "["+ error.response.status +"] "+ error.response.data
				else
					message = error.message;

				dispatch({ type: "FETCH_USER_DRIVETHRU_REJECTED", payload: { error: message, status: error.response.status || 500 } })
			});
	}
}