export default function reducer(
	state = {
		users: [],
		receipts: [],
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_APPROVALS_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_APPROVALS_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_APPROVALS_FULFILLED": {
			return { ...state, fetching: false, fetched: true, account: action.payload }
		}
	}

	return state
}