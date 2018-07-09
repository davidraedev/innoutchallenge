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