import React from "react"

export default class BackendPassThru extends React.Component {

	componentWillMount() {
		window.location.href = process.env.REACT_APP_BACKEND_URL + window.location.pathname
	}
}