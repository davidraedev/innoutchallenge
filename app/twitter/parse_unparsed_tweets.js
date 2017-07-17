var tweetController = require( "../../controller/tweet" );
var userController = require( "../../controller/user" );
var storeController = require( "../../controller/store" );
var db = require( "../db" );

db.connect().then(() => {
	return userController.updateAllUsersTotals();
//	return tweetController.parseTweets( null, 10000, true, true );
})/*
.then( ( vals ) => {
	console.log( "[%s] tweets found, [%s] tweets parsed", vals.found, vals.parsed );
	return storeController.parseTweetsForStores( vals.tweets );
})
.then(() => {
	return userController.updateAllUsersTotals();
})*/
.then(() => {
	db.close();
})
.catch( ( error ) => {
	throw error;
});