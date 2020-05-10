export default function reducer(
	state = {
		store: {
			_id: "",
			number: "",
			location: {
				address: "",
			},
		},
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_CLOSEST_STORE_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_CLOSEST_STORE_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_CLOSEST_STORE_FULFILLED": {
			return { ...state, fetching: false, fetched: true, store: action.payload }
		}
	}

	return state
}