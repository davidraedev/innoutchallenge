var mongoose = require( "mongoose" );
var Schema = mongoose.Schema;

var Hours = require( "./hours" );
var Location = require( "./location" );
var ObjectId = mongoose.Schema.Types.ObjectId;

/*
{
	StoreNumber: 272,
	Name: 'Highland',
	StreetAddress: '28009 Greenspot Rd.',
	City: 'Highland',
	State: 'CA',
	ZipCode: 92346,
	Latitude: 34.10791,
	Longitude: -117.19374,
	Distance: 7762.93,
	DriveThruHours: '10:30 a.m. - 1:30 a.m.',
	DiningRoomHours: '10:30 a.m. - 1:30 a.m.',
	OpenDate: '2012-03-29T00:00:00',
	ImageUrl: 'http://www.in-n-out.com/ino-images/default-source/location-store-images/Store_272.jpg',
	EnglishApplicationUrl: 'https://wfa.kronostm.com/index.jsp?locale=en_US&INDEX=0&applicationName=InNOutBurgerNonReqExt&LOCATION_ID=29490135687&SEQ=locationDetails',
	SpanishApplicationUrl: 'https://wfa.kronostm.com/index.jsp?locale=es_PR&INDEX=0&applicationName=InNOutBurgerNonReqExt&LOCATION_ID=29490135687&SEQ=locationDetails',
	PayRate: null,
	EmploymentNotes: [],
	ShowSeparatedHours: false,
	DiningRoomNormalHours: [],
	DriveThruNormalHours: [],
	HasDiningRoom: true,
	HasDriveThru: true,
	Directions: null,
	UnderRemodel: false,
	UseGPSCoordinatesForDirections: false
}
*/

var StoreSchema = new Schema({
	number: { type: Number, default: null },
	location: [ Location ],
	name: { type: String, default: null },
	dining_room_hours: {
		sunday: { type: Hours, default: null },
		monday: { type: Hours, default: null },
		tuesday: { type: Hours, default: null },
		wednesday: { type: Hours, default: null },
		thursday: { type: Hours, default: null },
		friday: { type: Hours, default: null },
		saturday: { type: Hours, default: null },
	},
	drive_thru_hours: {
		sunday: { type: Hours, default: null },
		monday: { type: Hours, default: null },
		tuesday: { type: Hours, default: null },
		wednesday: { type: Hours, default: null },
		thursday: { type: Hours, default: null },
		friday: { type: Hours, default: null },
		saturday: { type: Hours, default: null },
	},
	under_remodel: { type: Boolean, default: false },
	dining_room: { type: Boolean, default: false },
	drive_thru: { type: Boolean, default: false },
	remote_image_url: { type: String, default: null },
	//popup: ObjectId,
});

module.exports = mongoose.model( "Store", StoreSchema );