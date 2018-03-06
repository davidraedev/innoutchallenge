export default function reducer(
	state = {
		store: {
			location: {
				address: "",
			},
			dining_room_hours: {
				monday: { start: null, end: null },
				friday: { start: null, end: null },
				sunday: { start: null, end: null },
			},
			drive_thru_hours: {
				monday: { start: null, end: null },
				friday: { start: null, end: null },
				sunday: { start: null, end: null },
			},
		},
		fetching: false,
		fetched: false,
		error: null,
	},
	action
) {
	console.log( "action", action )
	switch ( action.type ) {
		case "FETCH_STORE_INFO_PENDING": {
			return { ...state, fetching: true }
		}
		case "FETCH_STORE_INFO_REJECTED": {
			return { ...state, fetching: false, error: action.payload }
		}
		case "FETCH_STORE_INFO_FULFILLED": {
			return { ...state, fetching: false, fetched: true, store: action.payload }
		}
	}

	return state
}