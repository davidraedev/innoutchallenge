const fs = require( "fs.promised" );

const db = require( "../db" );
const oldSiteContoller = require( "../../controller/old_site" );
const tweetController = require( "../../controller/tweet" );
const storeController = require( "../../controller/store" );
const userController = require( "../../controller/user" );

const mongo_log = "log/mongo.log";
const env_file = ".env";
const env_template = ".env.sample";
const use_cache = false;

// check mongo log exists
fs.access( mongo_log, fs.constants.F_OK | fs.constants.W_OK )
	.then( () => {
		console.log( "Mongo Log Already Exists" );
	})
	.catch( () => {
		// create blank mongo log
		return fs.writeFile( mongo_log, "" );
	})
	.catch( ( error ) => {
		// error creating mongo log
		throw error;
	})
	.then( () => {
		// check envronment file exists
		return fs.access( env_file, fs.constants.F_OK | fs.constants.W_OK );
	})
	.then( () => {
		console.log( "Environment File Already Exists" );
	})
	.catch( () => {
		// create environment file from the sample
		fs.createReadStream( env_template ).pipe( fs.createWriteStream( env_file ) );
		console.log( "Blank Environment File Created" );
	})
	.then( () => {
		return db.connect();
	})
	.then( () => {
		// delete all collections in mongo
		return oldSiteContoller.resetData();
	})
	.then( () => {
		// fetch the list of all the stores and import it
		return storeController.updateStores();
	})
	.then( () => {
		// fetch the remote/cached data from the old innoutchalllenge
		console.log( "Data Reset" );
		if ( ! use_cache )
			return oldSiteContoller.getRemote();
		else
			return oldSiteContoller.getLocal();
	})
	.then( ( data ) => {
		// import the old data
		console.log( "Data Retrieved" );
		return oldSiteContoller.importData( data );
	})
	.then( () => {
		// fetch all the tweets for the old, incomplete data
		console.log( "Data Imported, Refetching Tweets" );
		return oldSiteContoller.refetchTweetsAll();
	})
	.then( () => {
		// normalize the data to our new format
		console.log( "Tweets Fetched, Cleaning up Tweets" );
		return oldSiteContoller.postCleanup();
	})
	.then( () => {
		// parse all the tweets we just fetched
		console.log( "Data Cleaned, Parsing Tweets" );
		return tweetController.parseTweets( { source: 0 } );
	})
	.then( () => {
		// fetch any new tweets to fill in the gap, if any
		console.log( "Tweets Parsed, Getting New Tweets from Twitter" );
		return tweetController.getTweetsFromSearchApp();
	})
	.then( () => {
		// parse the new tweets
		console.log( "Tweets Fetched, Parsing Tweets" );
		return tweetController.parseTweets( true, true );
	})
	.then( () => {
		// parse the tweets for any store locations
		console.log( "Tweets Parsed, Getting Stores From Tweets" );
		return storeController.findStoresFromTweets();
	})
	.then( () => {
		// update all the user totals
		console.log( "Tweets Parsed for Stores, Updating User Totals" );
		return userController.updateAllUsersTotals();
	})
	.then( () => {
		console.log( "Totals Updated, All Done!" );
		db.close();
	})
	.catch( ( error ) => {
		throw error;
	});