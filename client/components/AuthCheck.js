import React from "react"
import { connect } from "react-redux"

import { fetchAuthState } from "../actions/authCheckActions"

@connect( ( store ) => {
	return {
		authenticated: store.authCheck.authenticated,
		error: store.authCheck.error,
		statusCode: store.authCheck.statusCode,
	}
})

export default class AuthCheck extends React.Component {

	componentWillMount() {
		this.props.dispatch( fetchAuthState( this.props.dispatch ) )
	}

	render() {
		return (
			<div></div>
		)
	}

}