export default function reducer(
	state = {
		error: false,
		success: false,
		saving: false,
	},
	action
) {
	switch ( action.type ) {
		case "SAVE_STORE_PRICE_PENDING": {
			return { ...state, saving: true }
		}
		case "SAVE_STORE_PRICE_REJECTED": {
			return { ...state, saving: false, error: action.payload }
		}
		case "SAVE_STORE_PRICE_FULFILLED": {
			return { ...state, saving: false, fetched: true, success: true }
		}
	}

	return state
}