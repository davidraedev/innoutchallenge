export default function reducer(
	state = {
		user: {
			name: null,
			totals: {
				stores: {
					unique: null,
					total: null,
					remaining: null,
				}
			},
			stores: [],
			latest_receipt: {
				number: null,
				tweet: {
					data: {
						text: null,
					}
				}
			},
		},
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_USER_STORES": {
			return { ...state, fetching: true }
		}
		case "FETCH_USER_STORES_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_USER_STORES_FULFILLED": {
			return { ...state, fetching: false, fetched: true, user: action.payload }
		}
	}

	return state
}