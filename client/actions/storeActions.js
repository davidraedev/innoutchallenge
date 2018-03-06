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
