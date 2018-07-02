export default function reducer(
	state = {},
	action
) {
	switch ( action.type ) {
		case "SAVE_STORE_PRICE_PENDING": {
			return { ...state, fetching: true }
		}
		case "SAVE_STORE_PRICE_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "SAVE_STORE_PRICE_FULFILLED": {
			return { ...state, fetching: false, fetched: true, success: true }
		}
	}

	return state
}