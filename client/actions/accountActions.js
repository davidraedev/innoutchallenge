import axios from "axios"

export function fetchAccount( dispatch ) {

	dispatch({ type: "FETCH_ACCOUNT_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/account/get", { method: "post", withCredentials: true } )
			.then( ( response ) => {
				dispatch({ type: "FETCH_ACCOUNT_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let data = {
					error: error.response.data,
					status: error.response.status
				}

				dispatch({ type: "FETCH_ACCOUNT_REJECTED", payload: data })
			});
	}
}

export function changeSetting( dispatch, settings ) {

	dispatch({ type: "CHANGE_ACCOUNT_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/account/set", {
			method: "post",
			withCredentials: true,
			data: settings,
		})
		.then( ( response ) => {
			console.log( "manual CHANGE_ACCOUNT_FULFILLED" )
			dispatch({ type: "CHANGE_ACCOUNT_FULFILLED", payload: response.data })
		})
		.catch( ( error ) => {
			console.log( "manual CHANGE_ACCOUNT_REJECTED" )

			let data = {
				error: error.response.data,
				status: error.response.status
			}

			dispatch({ type: "CHANGE_ACCOUNT_REJECTED", payload: data })
		});
	}
}

export function deleteAccount( dispatch, category, option, value ) {

	dispatch({ type: "DELETE_ACCOUNT_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/account/delete", { method: "post", withCredentials: true })
		.then( ( response ) => {
			dispatch({ type: "DELETE_ACCOUNT_FULFILLED", payload: response.data })
		})
		.catch( ( error ) => {

			let data = {
				error: error.response.data,
				status: error.response.status
			}

			dispatch({ type: "DELETE_ACCOUNT_REJECTED", payload: data })
		});
	}
}