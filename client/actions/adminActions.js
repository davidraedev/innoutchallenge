import axios from "axios"

export function fetchApprovals( dispatch ) {

	dispatch({ type: "FETCH_APPROVALS_PENDING" })
	return function ( dispatch ) {
		axios( process.env.REACT_APP_BACKEND_URL + "/api/admin/approvals/get", { method: "post", withCredentials: true } )
			.then( ( response ) => {
				dispatch({ type: "FETCH_APPROVALS_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let data = {
					error: error.response.data,
					status: error.response.status
				}

				dispatch({ type: "FETCH_APPROVALS_REJECTED", payload: data })
			});
	}
}

export function updateReceipt( dispatch, id, data ) {

	dispatch({ type: "ADMIN_UPDATE_RECEIPT_PENDING" })
	return function ( dispatch ) {

		let request_body = {
			id: id,
			receipt: data,
		};

		axios( process.env.REACT_APP_BACKEND_URL + "/api/admin/receipt/update", { method: "post", withCredentials: true, data: request_body } )
			.then( ( response ) => {
				dispatch({ type: "ADMIN_UPDATE_RECEIPT_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let data = {
					error: error.response.data,
					status: error.response.status
				}

				dispatch({ type: "ADMIN_UPDATE_RECEIPT_REJECTED", payload: data })
			});
	}
}

export function updateUser( dispatch, id, data ) {

	dispatch({ type: "ADMIN_UPDATE_USER_PENDING" })
	return function ( dispatch ) {

		let request_body = {
			id: id,
			user: data,
		};

		axios( process.env.REACT_APP_BACKEND_URL + "/api/admin/user/update", { method: "post", withCredentials: true, data: request_body } )
			.then( ( response ) => {
				dispatch({ type: "ADMIN_UPDATE_USER_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let data = {
					error: error.response.data,
					status: error.response.status
				}

				dispatch({ type: "ADMIN_UPDATE_USER_REJECTED", payload: data })
			});
	}
}

export function tweetUser( dispatch, user_id, text, tweet_id ) {

	dispatch({ type: "ADMIN_TWEET_USER_PENDING" })
	return function ( dispatch ) {

		let request_body = {
			user_id: user_id,
			text: text,
			tweet_id: tweet_id,
		};

		axios( process.env.REACT_APP_BACKEND_URL + "/api/admin/user/tweet", { method: "post", withCredentials: true, data: request_body } )
			.then( ( response ) => {
				dispatch({ type: "ADMIN_TWEET_USER_FULFILLED", payload: response.data })
			})
			.catch( ( error ) => {

				let data = {
					error: error.response.data,
					status: error.response.status
				}

				dispatch({ type: "ADMIN_TWEET_USER_REJECTED", payload: data })
			});
	}
}