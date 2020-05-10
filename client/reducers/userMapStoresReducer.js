export default function reducer(
	state = {
		stores: [],
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_USER_MAP_STORES": {
			return { ...state, fetching: true }
		}
		case "FETCH_USER_MAP_STORES_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_USER_MAP_STORES_FULFILLED": {
			return { ...state, fetching: false, fetched: true, stores: action.payload }
		}
	}

	return state
}