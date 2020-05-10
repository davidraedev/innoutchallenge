export default function reducer(
	state = {
		saving: false,
		saved: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "ADMIN_TWEET_USER_PENDING": {
			return { ...state, saving: true }
		}
		case "ADMIN_TWEET_USER_REJECTED": {
			return { ...state, saving: false, error: action.payload }
		}
		case "ADMIN_TWEET_USER_FULFILLED": {
			return { ...state, saving: false, saved: true }
		}
	}

	return state
}