const tweetController = require( "../../controller/tweet" );
const userController = require( "../../controller/user" );
const storeController = require( "../../controller/store" );
const db = require( "../db" );

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