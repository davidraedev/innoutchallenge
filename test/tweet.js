const chai = require( "chai" );
const expect = chai.expect;
const tweetController = require( "../controller/tweet" );

describe( "Parse Tweet for In Store", () => {

	it( "should return a 5", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo number five!" );
		expect( result ).to.equal( "5" );
	});

	it( "should not parse digits above 99", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo number 100!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse digits below 1", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo number 0!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse digits with 69", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo 69!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse digits in hashtags", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo number #7!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers in hashtags", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo number #five!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers appearing inside other words", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo I'm attentive!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers over 99", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo one-hundred!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers under 1", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo zero!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers with 69", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo sixty-nine!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse in the thousands", () => {
		let result = tweetController.parseForInStoreReceipt( "Heyo four thousand fifty-three!" );
		expect( result ).to.equal( false );
	});

});

describe( "Parse Tweet for Drive Thru", () => {

	it( "should return a 4060", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo 4060!" );
		expect( result ).to.equal( "4060" );
	});

	it( "should not parse digits below 4000", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo 3099!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse digits above 4999", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo 5000!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse digits in hashtags", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo number #4000!" );
		expect( result ).to.equal( false );
	});

	it( "should return a 4060", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo four thousand sixty!" );
		expect( result ).to.equal( "4060" );
	});

	it( "should not parse word-numbers below 4000", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo three thousand ninety nine!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers above 4999", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo five thousand!" );
		expect( result ).to.equal( false );
	});

	it( "should not parse word-numbers in hashtags", () => {
		let result = tweetController.parseForDriveThruReceipt( "Heyo number #four thousand!" );
		expect( result ).to.equal( false );
	});

});