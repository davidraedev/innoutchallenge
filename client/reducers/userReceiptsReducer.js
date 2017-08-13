export default function reducer(
	state = {
		user: {
			name: null,
			totals: {
				receipts: {
					unique: null,
					remaining: null,
					total: null,
				}
			},
			receipts: {},
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
		case "FETCH_USER_RECEIPTS_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_USER_RECEIPTS_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_USER_RECEIPTS_FULFILLED": {
			return { ...state, fetching: false, fetched: true, user: action.payload }
		}
	}

	return state
}