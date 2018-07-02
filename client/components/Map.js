import React from "react"
import { connect } from "react-redux"
import { geolocated } from "react-geolocated"

import GoogleMapReact from "google-map-react"

import { fetchUserMapStores } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import MapStoreMarker from "./MapStoreMarker"
import MapUserMarker from "./MapUserMarker"
import StoreOverlay from "./StoreOverlay"

require( "../less/Map.less" )

// this is the default map center for all stores ( as of Apr 22, 2018 )
const default_center = {
	lat: 35.978735,
	lng:  -109.88482,
};

@connect( ( store ) => {
	return {
		data: store.userMapStores,
		error: store.users.error,
	}
})

class Map extends React.Component {

	constructor() {
		super();
		this.showStoreOverlay = this.showStoreOverlay.bind( this );
	}

	componentWillMount() {

		this.setState({
			center: {
				all: default_center,
				user: default_center,
			},
			bounds: {
				all: {
					lat: {
						min: 0,
						max: 0,
					},
					lon: {
						min: 0,
						max: 0,
					},
				},
				user: {
					lat: {
						min: 0,
						max: 0,
					},
					lon: {
						min: 0,
						max: 0,
					},
				},
			},
			zoom: {
				all: 5,
				user: 5,
			},
			fit_user_only: true,
			storeOverlayNumber: null,
			storeOverlayPosition: 0,
			overlayVisible: false,
			user: {
				latitude: null,
				longitude: null,
			},
			did_request_coords: 0,
		});
		this.props.dispatch( fetchUserMapStores( this.props.dispatch, this.props.match.params.user, true ) );
	}

	calculateMapCenter( stores ) {

		let min_all_lat = Infinity,
			max_all_lat = -Infinity,
			min_all_lon = Infinity,
			max_all_lon = -Infinity,
			min_user_lat = Infinity,
			max_user_lat = -Infinity,
			min_user_lon = Infinity,
			max_user_lon = -Infinity;

		
		let all_center = {
			lat: 0,
			lng: 0,
		};

		let user_center = {
			lat: 0,
			lng: 0,
		};

		if ( stores ) {
			let user_has_receipts = false;
			stores.forEach( ( store ) => {
				min_all_lat = Math.min( store.location.latitude, min_all_lat );
				max_all_lat = Math.max( store.location.latitude, max_all_lat );
				min_all_lon = Math.min( store.location.longitude, min_all_lon );
				max_all_lon = Math.max( store.location.longitude, max_all_lon );
				if ( store.has_receipt ) { 
					user_has_receipts = true;
					min_user_lat = Math.min( store.location.latitude, min_user_lat );
					max_user_lat = Math.max( store.location.latitude, max_user_lat );
					min_user_lon = Math.min( store.location.longitude, min_user_lon );
					max_user_lon = Math.max( store.location.longitude, max_user_lon );
				}
			});

			all_center.lat = ( max_all_lat - ( ( max_all_lat - min_all_lat ) / 2 ) );
			all_center.lng = ( max_all_lon - ( ( max_all_lon - min_all_lon ) / 2 ) );

			user_center.lat = ( max_user_lat - ( ( max_user_lat - min_user_lat ) / 2 ) );
			user_center.lng = ( max_user_lon - ( ( max_user_lon - min_user_lon ) / 2 ) );

			if ( ! user_has_receipts ) {
				this.setState({
					fit_user_only: false,
				});
			}
		}

		this.setState({
			center: {
				all: all_center,
				user: user_center,
			},
			bounds: {
				all: {
					lat: {
						min: min_all_lat,
						max: max_all_lat,
					},
					lon: {
						min: min_all_lon,
						max: max_all_lon,
					},
				},
				user: {
					lat: {
						min: min_user_lat,
						max: max_user_lat,
					},
					lon: {
						min: min_user_lon,
						max: max_user_lon,
					},
				},
			},
		}, () => {
			this.calculateZoom( "all", () => this.calculateZoom( "user" ));
		});
	}

	calculateZoom( type, callback ) {

		let bounds = this.state.bounds[ type ];

		let width = this.mapContainer.offsetWidth;
		let height = this.mapContainer.offsetHeight;

		let dlat = Math.abs( bounds.lat.max - bounds.lat.min );
		let dlon = Math.abs( bounds.lon.max - bounds.lon.min );
		if ( dlat == 0 && dlon == 0 )
			return 4;

		// Center latitude in radians
		let clat = Math.PI * ( bounds.lat.min + bounds.lon.max ) / 360.;

		let C = 0.0000107288;
		let z0 = Math.ceil( Math.log( dlat / ( C * height ) ) / Math.LN2 );
		let z1 = Math.ceil( Math.log( dlon / ( C * width * Math.cos( clat ) ) ) / Math.LN2 );

		let zoom = ( z1 > z0 ) ? z1 : z0;

		let data = { ...this.state.zoom };
		data[ type ] = zoom;

		this.setState({
			zoom: data,
		}, callback );
	}

	componentDidUpdate( old_props ) {
		if ( JSON.stringify( old_props ) !== JSON.stringify( this.props ) )
			this.calculateMapCenter( this.props.data.stores );

		// user did allow geolocation
		if ( this.props.isGeolocationAvailable && this.props.isGeolocationEnabled && this.state.did_request_coords === 0 ) {
			this.setState({
				did_request_coords: 1,
			});

			// send geolocation request once the coordinates have been retrieved
			let interval = setInterval( () => {
				console.log( "a" );

				if ( ! this.props.coords )
					return;

				this.setState({
					user: {
						latitude: this.props.coords.latitude,
						longitude: this.props.coords.longitude,
					},
					did_request_coords: 2,
				});

				clearInterval( interval );

			}, 300 );
		}
	}

	showStoreOverlay( number ) {

		console.log( "Show Store Overlay" )
		if ( number === "user" )
			return;

		this.setState({
			storeOverlayNumber: number,
			overlayPosition: ( document.documentElement.scrollTop + 50 ),
			overlayVisible: true,
		});
		
	}

	render() {

		const { data, error } = this.props;

		let zoom = ( this.state.fit_user_only ) ? this.state.zoom.user : this.state.zoom.all;
		let center = ( this.state.fit_user_only ) ? this.state.center.user : this.state.center.all;

		let marker_html;
		if ( data.stores.length ) {

			marker_html = data.stores.map( ( store ) => {
				return <MapStoreMarker
							lat={ store.location.latitude }
							lng={ store.location.longitude }
							number={ store.number }
							key={ store.number }
							visited={ store.has_receipt }
						/>
			});

			if ( this.state.user.latitude ) {
				marker_html.push(
					<MapUserMarker
							lat={ this.state.user.latitude }
							lng={ this.state.user.longitude }
							key="user"
						/>
				);
			}

		}

		return (
			<div>
				<Error messages={ [ error ] } />
				<TopNav title="Map (very beta)" showBackButton={ false } />
				<SubNav url={ this.props.match.url } type="user" />
				<div className="container" id="main_content" ref={ input => { this.mapContainer = input } }>
					<GoogleMapReact
						bootstrapURLKeys={{ key: [ "AIzaSyB9HifUIFlzYEZd63WGpGHFcX41kypkdGw" ] }}
						center={ center }
						zoom={ 5 }
						onChildClick={ this.showStoreOverlay }
					>
						{ marker_html }
					</GoogleMapReact>
					<StoreOverlay number={ this.state.storeOverlayNumber } position={ this.state.overlayPosition } show={ this.state.overlayVisible } />
				</div>
			</div>
		)
	}
}

export default geolocated({
	positionOptions: {
		enableHighAccuracy: false,
	},
	userDecisionTimeout: 5000,
})( Map );