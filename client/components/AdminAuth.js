import React from "react"

export default class AdminAuth extends React.Component {

	componentWillMount() {
		console.log( this );
		window.location.href = process.env.REACT_APP_BACKEND_URL + "/admin/signin"
	}
}