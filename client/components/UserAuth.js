import React from "react"

export default class UserAuth extends React.Component {

	componentWillMount() {
		console.log( this );
		window.location.href = process.env.REACT_APP_BACKEND_URL + "/signin"
	}
}