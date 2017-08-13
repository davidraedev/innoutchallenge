import React from "react"

require( "../less/Error.less" )

export default class Error extends React.Component {

	createError( error ) {
		if ( ! error )
			error = {}
		let messages = []
		if ( error.message )
			messages.push( error.message )
		if ( error.status === 401 )
			messages.push( "Unauthorized, please log in" )
		return messages
	}

	render() {

		let errors = this.props.error

		let new_messages = []
		errors.forEach( ( error ) => {
			new_messages = new_messages.concat( this.createError( error ) )
		})

		const content = new_messages.map( ( message, index ) => (
			<div class="error" key={ index }>
				{ message }
			</div>
		))

		return (
			<div class="errors">
				{ content }
			</div>
		)
	}
}