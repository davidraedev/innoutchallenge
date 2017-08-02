module.exports = class AppError extends Error {
	constructor ( message, name ) {
		super( message );
		Error.captureStackTrace( this, this.constructor );
		this.name = this.constructor.name;
	}
};