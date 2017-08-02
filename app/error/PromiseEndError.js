module.exports = class PromiseEndError extends require( "./AppError" ) {
	constructor ( message, name ) {
		super( message || "Ending Promise", "PromiseEndError" );
	}
};