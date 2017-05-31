var innoutLocations = require( "innout_locations" );
var Store = require( "../../model/store" );

/*

Format of the In-N-Out JSON

[ {
	"StoreNumber": 303,
	"Name": "Alameda",
	"StreetAddress": "555 Willie Stargell Ave.",
	"City": "Alameda",
	"State": "CA",
	"ZipCode": 94501,
	"Latitude": 37.78372,
	"Longitude": -122.27728,
	"Distance": 7951.76,
	"DriveThruHours": "10:30 a.m. - 1:00 a.m.",
	"DiningRoomHours": "10:30 a.m. - 1:00 a.m.",
	"OpenDate": "2015-05-14T00:00:00",
	"ImageUrl": "http://www.in-n-out.com/ino-images/default-source/location-store-images/store_303.png",
	"EnglishApplicationUrl": "https://wfa.kronostm.com/index.jsp?locale=en_US&INDEX=0&applicationName=InNOutBurgerNonReqExt&LOCATION_ID=60388278526&SEQ=locationDetails",
	"SpanishApplicationUrl": "https://wfa.kronostm.com/index.jsp?locale=es_PR&INDEX=0&applicationName=InNOutBurgerNonReqExt&LOCATION_ID=60388278526&SEQ=locationDetails",
	"PayRate": null,
	"EmploymentNotes": [],
	"ShowSeparatedHours": false,
	"DiningRoomNormalHours": [],
	"DriveThruNormalHours": [],
	"HasDiningRoom": true,
	"HasDriveThru": true,
	"Directions": null,
	"UnderRemodel": false,
	"UseGPSCoordinatesForDirections": false
}, ]

*/

function left_pad( num, size, char ) {
    var s = num + "";
    while ( s.length < size )
    	s = char + s;
    return s;
}

/*

	The API does not list out the extended weekend hours.
	Nor the full extend of non-standard hours.

	We mark them as non-standard and will have to manually
	grab them from http://locations.in-n-out.com/STORENUMBER,
	which does list out the full hours.

*/
function parseHours( hours_string, location ) {

	let days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday"
	];

	let all_hours = {};
	days.forEach(function( day ){

		let hours = {};

		// regular hours
		if ( hours_string == "10:30 a.m. - 1:00 a.m." ) {
			hours.start = 1030;
			if ( day === "friday" || day === "saturday" )
				hours.end = 130;
			else
				hours.end = 100;
		}
		// non-standard hours
		else {
			hours.manual = true;
		}

		all_hours[ day ] = hours;

	});

	return all_hours;
}

function parseLocation( data ) {

	let location = {};
		location.latitude = data.Latitude;
		location.longitude = data.Longitude;
		location.address = data.StreetAddress;
		location.city = data.City;
		location.state = data.State;
		location.zipcode = left_pad( String( data.ZipCode ), 5, "0" );
		location.country = "US";

	return location;
}

function parseStore( data ) {

	let store = {};
		store.number = data.StoreNumber;
		store.name = data.Name;
		store.location = parseLocation( data );
		store.dining_room_hours = parseHours( data.DiningRoomHours, "dining_room" );
		store.drive_thru_hours = parseHours( data.DriveThruHours, "drive_thru" );

		// stores without an open date aren't open yet
		let open_date = data.OpenDate || "1900-01-01";
		store.opened = Date.parse( open_date.substring( 0, 10 ) );
		store.popup = false;
		store.under_remodel = data.UnderRemodel;
		store.dining_room = data.HasDiningRoom;
		store.drive_thru = data.HasDriveThru;
		store.remote_image_url = data.ImageUrl;

	return store;
}

db.connect().then( function( connection ){

	innoutLocations.get().then( function( json ){

		json.data.forEach(function( d, index ){
			let store = parseStore( d );
			console.log( "store [%d]", store.number );
			Store.update(
				{ number: store.number },
				{ "$set": store },
				{ upsert: true, setDefaultsOnInsert: true },
				function ( error ) {
					if ( error )
						throw new Error( error );
				}
			);
		});

	}).catch( function( error ){
		if ( error )
			throw new Error( error );
	});
	
}).catch( function( error ){
	if ( error )
		throw new Error( error );
});