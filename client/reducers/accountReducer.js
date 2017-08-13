export default function reducer(
	state = {
		account: {
			name: null,
			settings: {
				tweet: {
					unique_numbers: false,
					milestones: false, 
				},
				dm: {
					unique_numbers: false,
					milestones: false,
					store: false,
					drive_thru: false, 
				},
			},
		},
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_ACCOUNT_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_ACCOUNT_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_ACCOUNT_FULFILLED": {
			console.log( "action", action )
			return { ...state, fetching: false, fetched: true, account: action.payload }
		}
		case "CHANGE_ACCOUNT_PENDING": {
			return { ...state, fetching: true }
		}
		case "CHANGE_ACCOUNT_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "CHANGE_ACCOUNT_FULFILLED": {
			console.log( "action", action )
			return { ...state, fetching: false, fetched: true, account: action.payload }
		}
		case "DELETE_ACCOUNT_PENDING": {
			return { ...state, fetching: true }
		}
		case "DELETE_ACCOUNT_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "DELETE_ACCOUNT_FULFILLED": {
			console.log( "action", action )
			return { ...state, fetching: false, fetched: true, account: action.payload }
		}
	}

	return state
}