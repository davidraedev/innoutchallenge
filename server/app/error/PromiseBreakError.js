module.exports = class PromiseBreakError extends require( "./AppError" ) {
	constructor ( message, name ) {
		super( message || "Breaking out of Promise Chain", "PromiseBreakError" );
	}
};