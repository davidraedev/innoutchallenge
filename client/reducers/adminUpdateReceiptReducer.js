export default function reducer(
	state = {
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "ADMIN_UPDATE_RECEIPT_PENDING": {
			return { ...state, fetching: true }
		}
		case "ADMIN_UPDATE_RECEIPT_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "ADMIN_UPDATE_RECEIPT_FULFILLED": {
			return { ...state, fetching: false, fetched: true }
		}
	}

	return state
}