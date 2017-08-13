export default function reducer(
	state = {
		user: {
			name: null,
			totals: {
				drivethru: {
					unique: null,
					total: null,
					remaining: null,
				}
			},
			drivethru: [],
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
		statusCode: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_USER_DRIVETHRU": {
			return { ...state, fetching: true }
		}
		case "FETCH_USER_DRIVETHRU_REJECTED": {
			return { ...state, fetching: false, error: action.payload.error, statusCode: action.payload.statusCode }
		}
		case "FETCH_USER_DRIVETHRU_FULFILLED": {
			return { ...state, fetching: false, fetched: true, user: action.payload }
		}
	}

	return state
}