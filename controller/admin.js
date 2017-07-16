const Twitter = require( "twitter" );
const TwitterPlace = require( "../model/twitter_place" );
const TwitterUser = require( "../model/twitter_user" );
const utils = require( "../app/utils" );
require( "dotenv" ).config();

const ObjectId = require( "mongoose" ).Schema.Types.ObjectId;


/*
module.exports = {
	sendTweet: sendTweet,
	createNewReceiptTweetText: createNewReceiptTweetText,
	createNewUserTweetText: createNewUserTweetText,
	sendNewUserTweet: sendNewUserTweet,
	createNewUserTweetParams: createNewUserTweetParams,
};*/