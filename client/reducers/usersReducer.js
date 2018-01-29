export default function reducer(
	state = {
		users: [],
		fetching: false,
		fetched: false,
		error: null,
		hasPreviousPage: false,
		hasNextPage: false,
		currentPage: 1,
		searchText: "",
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_USERS_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_USERS_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_USERS_FULFILLED": {
			return {
				...state,
				fetching: false,
				fetched: true,
				users: action.payload.users,
				hasPreviousPage: action.payload.hasPreviousPage,
				hasNextPage: action.payload.hasNextPage,
				currentPage: action.payload.currentPage,
				searchText: action.payload.searchText,
			}
		}
		case "CLEAR_USERS_FULFILLED": {
			return {
				...state,
				users: [],
			}
		}
	}

	return state
}