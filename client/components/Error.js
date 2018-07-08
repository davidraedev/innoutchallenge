import React from "react";

require( "../less/Error.less" );

export default class Error extends React.Component {

	createError( error ) {
		if ( ! error )
			error = {};
		let messages = [];
		if ( typeof error === "string" )
			messages.push( error );
		else if ( error.message )
			messages.push( error.message );
		if ( error.status === 401 )
			messages.push( "Unauthorized, please log in" );
		return messages;
	}

	render() {

		const errors = this.props.messages;

		console.log( "<Error> errors", errors )

		let new_messages = []
		errors.forEach( ( error ) => {
			new_messages = new_messages.concat( this.createError( error ) );
		});

		console.log( "<Error> new_messages", new_messages )

		const content = new_messages.map( ( message, index ) => (
			<div class="message" key={ index }>
				{ message }
			</div>
		))

		return (
			<div class="error">
				{ content }
			</div>
		)
	}
}