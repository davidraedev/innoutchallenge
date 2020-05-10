import axios from "axios"

/*
{
	type: "FETCH_STORE_INFO_FULFILLED",
	payload: {
		address: String,
	}
}
*/
export function fetchStoreInfo( dispatch, number ) {

	dispatch({ type: "FETCH_STORE_INFO_PENDING" })

	if ( ! number ) {
		return function( dispatch ) {
			dispatch({ type: "FETCH_STORE_INFO_REJECTED", payload: "Store Number Required" });
		};
	}

	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/store/info", {
				method: "post",
				data: {
					number: number,
				},
				withCredentials: true
			})
				.then( ( response ) => {
					dispatch({ type: "FETCH_STORE_INFO_FULFILLED", payload: response.data })
				})
				.catch( ( error ) => {

					let data = {
						error: error.response.data,
						status: error.response.status
					}

					dispatch({ type: "FETCH_STORE_INFO_REJECTED", payload: data })
				});
	}
}


export function fetchStoresList( dispatch ) {

	dispatch({ type: "FETCH_STORES_LIST_PENDING" })

	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/stores/list", { method: "post" })
				.then( ( response ) => {

					let stores_sorted = response.data.sort( ( a, b ) => {
						return ( a.number - b.number );
					});

					dispatch({ type: "FETCH_STORES_LIST_FULFILLED", payload: stores_sorted })
				})
				.catch( ( error ) => {

					let data = {
						error: error.response.data,
						status: error.response.status
					}

					dispatch({ type: "FETCH_STORES_LIST_REJECTED", payload: data })
				});
	}
}

export function getStorePrice( dispatch, store_id ) {

	dispatch({ type: "FETCH_STORE_PRICE_PENDING" })

	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/store/price/get", {
					method: "post",
					data: {
						store: store_id,
					},
				})
				.then( ( response ) => {
					dispatch({ type: "FETCH_STORE_PRICE_FULFILLED", payload: response.data })
				})
				.catch( ( error ) => {

					let data = {
						error: error.response.data,
						status: error.response.status
					}

					dispatch({ type: "FETCH_STORE_PRICE_REJECTED", payload: data })
				});
	}
}

export function saveStorePrice( dispatch, store_id, prices, image = null ) {

	dispatch({ type: "SAVE_STORE_PRICE_PENDING" })

	let data = {
		store: store_id,
		prices: prices,
	};
	
	if ( image )
		data.image = image;

	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/store/price/save", {
					method: "post",
					data: data,
				})
				.then( ( response ) => {
					dispatch({ type: "SAVE_STORE_PRICE_FULFILLED", payload: response.data })
				})
				.catch( ( error ) => {

					let data = {
						error: error.response.data,
						status: error.response.status
					}

					dispatch({ type: "SAVE_STORE_PRICE_REJECTED", payload: data })
				});
	}
}


export function getClosestStore( dispatch, latitude, longitude ) {

	dispatch({ type: "FETCH_CLOSEST_STORE_PENDING" })

	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/store/closest", {
					method: "post",
					data: {
						latitude: latitude,
						longitude: longitude,
					},
				})
				.then( ( response ) => {
					dispatch({ type: "FETCH_CLOSEST_STORE_FULFILLED", payload: response.data })
				})
				.catch( ( error ) => {

					let data = {
						error: error.response.data,
						status: error.response.status
					}

					dispatch({ type: "FETCH_CLOSEST_STORE_REJECTED", payload: data })
				});
	}
}