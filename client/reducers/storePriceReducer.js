export default function reducer(
	state = {
		price: {
			date: new Date(),
			burgers: {
				double_double: null,
				cheeseburger: null,
				hamburger: null,
				fries: null,
			},
			sodas: {
				small: null,
				medium: null,
				large: null,
				xlarge: null,
			},
			other_drinks: {
				shake: null,
				milk: null,
				coffee: null,
				cocoa: null,
			}
		},
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	switch ( action.type ) {
		case "FETCH_STORE_INFO_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_STORE_INFO_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_STORE_INFO_FULFILLED": {
			return { ...state, fetching: false, fetched: true, price: action.payload }
		}
	}

	return state
}