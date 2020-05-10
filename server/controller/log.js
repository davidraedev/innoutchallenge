const winston = require( "winston" );
const tsFormat = () => new Date();
const log = ( log_path ) => {

	let config = {
		transports: [
			new ( winston.transports.Console )( {
				timestamp: tsFormat,
				colorize: true,
				level: "debug",
				handleExceptions: true,
			} ),
		]
	};

	if ( log_path ) {
		config.transports.push(
			new ( winston.transports.File )( {
				filename: log_path,
				timestamp: tsFormat,
				json: true,
				level: "debug",
				handleExceptions: true,
			} )
		);
	}

	return new ( winston.Logger )( config );
};

module.exports = log;