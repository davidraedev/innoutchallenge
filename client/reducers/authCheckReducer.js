export default function reducer(
	state = {
		authenticated: false,
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_AUTH_CHECK": {
			return { ...state, fetching: true }
		}
		case "FETCH_AUTH_CHECK_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_AUTH_CHECK_FULFILLED": {
			return { ...state, fetching: false, fetched: true, authenticated: action.payload.authenticated }
		}
	}

	return state
}