import axios from "axios"

/*
{
	type: "FETCH_AUTH_CHECK_FULFILLED",
	payload: [{
		authenticated: Boolean,
	}]
}
*/
export function fetchAuthState( dispatch ) {

	dispatch({ type: "FETCH_AUTH_CHECK_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/auth/check", { method: "post", withCredentials: true } )
			.then( ( response ) => {
				dispatch({ type: "FETCH_AUTH_CHECK_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {
				dispatch({ type: "FETCH_AUTH_CHECK_REJECTED", payload: { message: error.response.data, status: error.response.status } })
			});
	}
}