export default function reducer(
	state = {
		stores: [
			{
				_id: null,
				number: null,
			},
		],
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_STORES_LIST_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_STORES_LIST_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_STORES_LIST_FULFILLED": {
			return { ...state, fetching: false, fetched: true, stores: action.payload }
		}
	}

	return state
}