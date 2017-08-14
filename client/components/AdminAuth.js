import React from "react"

export default class AdminAuth extends React.Component {

	componentWillMount() {
		window.location.href = process.env.REACT_APP_BACKEND_URL + "/admin/signin"
	}
}