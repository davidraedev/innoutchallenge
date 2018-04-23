import React from "react"
import { connect } from "react-redux"
import GoogleMapReact from "google-map-react"
import supercluster from "supercluster"

import { fetchUserMapStores } from "../actions/userActions"

import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
import MapStoreMarker from "./MapStoreMarker"
import MapClusterMarker from "./MapClusterMarker"
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

export default class Map extends React.Component {

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
			zoom_type: "all",
			storeOverlayNumber: null,
			storeOverlayPosition: 0,
			clusters: [],
			lastCoordinates: null,
			lastZoom: null,
		});
		this.props.dispatch( fetchUserMapStores( this.props.dispatch, this.props.match.params.user, true ) );
		this.handleMapChange = this.handleMapChange.bind( this );
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
					zoom_type: "all",
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
		},
		() => {
			this.calculateZoom( () => {
				this.setState({ zoom_type: "user" }, () => {
					this.calculateZoom();
				});
			});
		});
	}

	calculateZoom( callback ) {

		let bounds = this.state.bounds[ this.state.zoom_type ];

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
		data[ this.state.zoom_type ] = zoom;

		this.setState({
			zoom: data,
		}, callback );
	}

	componentWillReceiveProps( new_props ) {
		console.log( "componentWillReceiveProps" )

		console.log( "new_props", JSON.stringify( new_props ) )
		console.log( "this.props", JSON.stringify( this.props ) )

		if ( JSON.stringify( new_props ) === JSON.stringify( this.props ) )
			return;

		this.calculateMapCenter( new_props.data.stores, () => {
			this.updateClusters( new_props.data.stores, this.state.zoom[ this.state.zoom_type ] );
		});
	}

	showStoreOverlay( key, props ) {

		console.log( "showStoreOverlay", props )

		if ( props.isCluster )
			return;

		this.setState({
			storeOverlayNumber: props.number,
			overlayPosition: ( document.documentElement.scrollTop + 50 ),
		})
	}

	createGeoJSONPoint( latitude, longitude, properties ) {

		if ( ! properties )
			properties = {};

		return {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [ longitude, latitude ],
			},
			properties: properties,
		};
	}

	updateClusters( stores, zoom ) {

		console.log( "updateClusters", stores, zoom );

		this.setState({ 
			clusters: this.createClusters( stores, zoom )
		});
	}

	createClusters( stores, zoom ) {

		console.log( "createClusters", stores, zoom );

		if ( ! stores.length )
			return [];

		let points = stores.map( ( store ) => {
						return this.createGeoJSONPoint(
							store.location.latitude,
							store.location.longitude,
							{ number: store.number }
						);
					});

		const clusterObj = supercluster({
			radius: 80,
			maxZoom: 16
		});

		clusterObj.load( points );

		let bounds = this.state.bounds[ this.state.zoom_type ];
	
		let bounding_box = [
			bounds.lon.min,
			bounds.lat.min,
			bounds.lon.max,
			bounds.lat.max,
		];

		console.log( "bounding_box", bounding_box )

		let clusters = clusterObj.getClusters( [ -180, -85, 180, 85 ], zoom );

		console.log( "createClusters clusters", clusters )

		return clusters;
	}

	handleMapChange( newOptions ) {

		console.log( "newOptions", newOptions );

		if (
			JSON.stringify( newOptions.center ) !== JSON.stringify( this.state.lastCoordinates ) ||
			JSON.stringify( newOptions.zoom ) !== JSON.stringify( this.state.lastZoom )
		) {

			console.log( "setting new data" );

			let newState = {
				lastCoordinates: newOptions.center,
				lastZoom: newOptions.zoom,
			};
			newState.zoom = { ...this.state.zoom };
			newState.zoom[ this.state.zoom_type ] = newOptions.zoom;

			console.log( "newState", newState );

			this.setState( newState );
			this.updateClusters( this.props.data.stores, this.state.zoom[ this.state.zoom_type ] );
		}
	}

	render() {

		const { data, error } = this.props;

		let { zoom_type, clusters } = this.state;
		let zoom = this.state.zoom[ zoom_type ];

		let center = this.state.center[ zoom_type ];

		console.log( "clusters", clusters )
		console.log( "this.state", this.state )

		let marker_html;
		if ( clusters.length ) {
			marker_html = clusters.map( ( store, index ) => {
				if ( store.properties.cluster ) {
					console.log( "MapClusterMarker" )
					return <MapClusterMarker
							lat={ store.geometry.coordinates[1] }
							lng={ store.geometry.coordinates[0] }
							key={ index }
							isCluster={ true }
							amount={ store.properties.point_count }
							visited={ store.properties.has_receipt }
						/>
				}
				else {
					console.log( "MapStoreMarker" )
					return <MapStoreMarker
							lat={ store.geometry.coordinates[1] }
							lng={ store.geometry.coordinates[0] }
							number={ store.properties.number }
							key={ index }
							visited={ store.properties.has_receipt }
						/>
				}
			});
		}

		return (
			<div>
				<Error error={ [ error ] } />
				<TopNav title="Map (very beta)" showBackButton={ false } />
				<SubNav url={ this.props.match.url } type="user" />
				<div className="container" id="main_content" ref={ input => { this.mapContainer = input } }>
					<GoogleMapReact
						bootstrapURLKeys={{ key: [ "AIzaSyB9HifUIFlzYEZd63WGpGHFcX41kypkdGw" ] }}
						center={ center }
						zoom={ 5 }
						onChildClick={ this.showStoreOverlay }
						onChange={ this.handleMapChange }
					>
						{ marker_html }
					</GoogleMapReact>
					<StoreOverlay number={ this.state.storeOverlayNumber } position={ this.state.overlayPosition } />
				</div>
			</div>
		)
	}
}