import React from "react"
import { Route, Redirect } from "react-router-dom"
import { connect } from "react-redux"

import { fetchAuthState } from "../actions/authCheckActions"

@connect( ( store ) => {
	return {
		authenticated: store.authCheck.authenticated,
		adminAuthenticated: store.authCheck.adminAuthenticated,
		error: store.authCheck.error,
		statusCode: store.authCheck.statusCode,
	}
})

export default class PrivateRoute extends React.Component {

	componentWillMount() {

		this.setState({
			initial: true,
		});

		this.props.dispatch( fetchAuthState( this.props.dispatch ) )
	}

	componentDidUpdate( new_props ) {
		console.log( "componentDidUpdate", this.props, new_props );
		if ( this.props.adminAuthenticated !== undefined && this.state.initial !== false ) {
			this.setState({
				initial: false,
			});
		}
	}

	render() {

		if ( this.state.initial === true ) {
			return (
				<div>Waiting for Auth</div>
			);
		}

		let { authenticated, adminAuthenticated, error, statusCode, admin, component } = this.props;

		if ( ( admin === true && ! adminAuthenticated ) || ! authenticated ) {
			console.log( "PrivateRoute: not authenticated" )
			return (
				<Redirect
					to={{
						pathname: "/signin",
						state: { from: this.props.location }
					}}
				/>
			);
		}
		else {
			console.log( "PrivateRoute: is authenticated" )
			return React.createElement( component, this.props );
		}
	}
}