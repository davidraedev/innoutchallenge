import React from "react";

require( "../less/Success.less" );

export default class Success extends React.Component {

	render() {

		let { messages } = this.props;

		const content = messages.map( ( message, index ) => {
			if ( message.length ) {
				return  (
					<div class="message" key={ index }>
						{ message }
					</div>
				);
			}
		});

		return (
			<div class="success">
				{ content }
			</div>
		)
	}
}