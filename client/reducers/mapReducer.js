export default function reducer(
	state = {
		user : {
			stores: {},
		},
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_MAP_STORE_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_MAP_STORE_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_MAP_STORE_FULFILLED": {
			return { ...state, fetching: false, fetched: true, store: action.payload }
		}
	}

	return state
}