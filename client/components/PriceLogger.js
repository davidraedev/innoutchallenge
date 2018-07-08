import React from "react";
import { connect } from "react-redux";
import Webcam from "react-webcam";
import Select from "react-select";

import { fetchStoresList, saveStorePrice, getStorePrice, getClosestStore } from "../actions/storeActions";

import Error from "./Error";
import Success from "./Success";
import TopNav from "./TopNav";
import SubNav from "./SubNav";
import PageNotAuthorized from "./PageNotAuthorized";
import Geolocation from "./Geolocation";

require( "../less/PriceLogger.less" )
require( "../../node_modules/react-select/less/select.less" );
@connect( ( store ) => {
	return {
		prices: store.storePriceReducer.price,
		stores: store.storesListReducer.stores,
		error: store.storesListReducer.error,
		closest: store.storeClosestReducer.store,
		saveError: store.saveStorePriceReducer.error,
		saveSuccess: store.saveStorePriceReducer.success,
	}
})

class PriceLogger extends React.Component {

	componentWillMount() {

		this.props.dispatch( fetchStoresList( this.props.dispatch ) );
		this.props.dispatch( getStorePrice( this.props.dispatch, null ) );
		this.setState({
			store: "",
			prices: this.props.prices,
			did_request_coords: 0,
			menu_image: "",
			allow_camera: false,
			geolocation: {},
		});

		this.savePrice = this.savePrice.bind( this );
		this.setStore = this.setStore.bind( this );
		this.capture = this.capture.bind( this );
		this.setWebcamRef = this.setWebcamRef.bind( this );
		this.enableGeoLocation = this.enableGeoLocation.bind( this );

		this.getGeolocationInnerRef = this.getGeolocationInnerRef.bind( this );
		this.getLocation = this.getLocation.bind( this );

		this.geolocationHandler = this.geolocationHandler.bind( this );
	}

	geolocationHandler() {
		console.log( "geolocationHandler", this.geolocationInnerRef.state )
		this.setState({
			geolocation: this.geolocationInnerRef.state,
		}, () => { console.log( "statev", this.state ) });
	}

	geolocationInnerRef;

	getGeolocationInnerRef( ref ) {
		console.log( "ref", ref )
		this.geolocationInnerRef = ref;
	}

	getLocation() {
		this.geolocationInnerRef && this.geolocationInnerRef.getLocation();
	}

	priceInputHtml( value = "", tabindex = 0, changeHandler ) {
		return (
			<div class="price">
				<div class="input">
					<input type="number" placeholder="0.00" step="0.01" defaultValue={ value } tabIndex={ tabindex } onChange={ changeHandler } />
				</div>
			</div>
		)
	}

	savePrice() {
		this.props.dispatch( saveStorePrice( this.props.dispatch, this.state.store, this.state.prices ) );
	}

	setStore( select_value ) {
		console.log( "select_value", select_value )
		let store_id = select_value.value;
		this.setState({
			store: store_id,
		})
		this.props.dispatch( getStorePrice( this.props.dispatch, store_id ) );
	}

	enableGeoLocation() {
		this.getLocation();
	}

	componentDidUpdate( old_props ) {

		window.scrollTo( 0, 0 );

		// show error
		if ( this.props.error && this.props.error !== old_props.error ) {
			console.error( this.props.error );
		}

		// user did allow geolocation
		if ( this.state.geolocation.isGeolocationAvailable && this.state.geolocation.isGeolocationEnabled && this.state.did_request_coords === 0 ) {
			this.setState({
				did_request_coords: 1,
			});

			// send geolocation request once the coordinates have been retrieved
			let interval = setInterval( () => {

				if ( ! this.state.geolocation.coords )
					return;

				this.props.dispatch( getClosestStore( this.props.dispatch, this.state.geolocation.coords.latitude, this.state.geolocation.coords.longitude ) );
				clearInterval( interval );

			}, 300 );
		}

		// geolocation request returned, set store dynamically
		if ( ! old_props.closest._id && this.props.closest._id ) {
			this.setState({
				store: this.props.closest._id,
			});
		}
	}

	capture() {
		console.log( "capture" );
		console.log( this.webcam.getScreenshot() );
		this.setState({
			menu_image: this.webcam.getScreenshot(),
		});
	}

	setWebcamRef( webcam ) {
		this.webcam = webcam;
	}

	getStoresOptions() {
		return this.props.stores.map( ( store ) => {
			return {
				value: store._id,
				label: store.number + " - " + store.location.address + " (" + store.location.city + ", " + store.location.state + ")"
			};
		});
	}

	render() {

		const videoConstraints = {
			width: 1280,
			height: 720,
			facingMode: "environment",
		};

		let tabindex = 3;
		let errors = [];
		let successes = [];

		const { stores, error, coords, saveError, saveSuccess } = this.props;
		const { prices } = this.state;

		if ( saveError )
			errors.push( "Failed to save Store Price ["+ saveError +"]" );

		if ( saveSuccess )
			successes.push( "Price Saved" );

		if ( error ) {
			console.log( "error", error )
			if ( error.status === 401 ) {
				console.log( "401" )
				return (
					<PageNotAuthorized returnUrl={ this.props.location.pathname } />
				)
			}
		}

		let date = new Date();

		let burgers = [
			{ name: "Double-Double", key: "double_double" },
			{ name: "Cheeseburger", key: "cheeseburger" },
			{ name: "Hamburger", key: "hamburger" },
			{ name: "French Fries", key: "fries" },
		];
		let burgers_html = burgers.map( ( burger, index ) => {
			return (
				<div class="item" key={ index }>
					<div class="title">{ burger.name.toUpperCase() }</div>
					{ this.priceInputHtml( prices.burgers[ burger.key ], tabindex++, ( event ) => {
						let new_state = { ...this.state };
							new_state.prices.burgers[ burger.key ] = event.target.value;
						this.setState( new_state );
					} ) }
				</div>
			)
		});

		let sodas = [
			{ name: "Coke" },
			{ name: "Root Beer" },
			{ name: "Lemonade" },
			{ name: "Iced Tea" },
			{ name: "Seven-Up" },
			{ name: "Dr Pepper" },
		];
		let soda_row_length = 4;
		let sodas_row_1 = sodas.slice( 0, soda_row_length ).map( ( soda, index ) => {
			return (
				<div class="soda" key={ index }>{ soda.name.toUpperCase() }</div>
			);
		});
		let sodas_row_2 = sodas.slice( soda_row_length ).map( ( soda, index ) => {
			return (
				<div class="soda" key={ index + soda_row_length }>{ soda.name.toUpperCase() }</div>
			);
		});

		let soda_prices = [
			{ name: "SM", key: "small" },
			{ name: "MED", key: "medium" },
			{ name: "LG", key: "large" },
			{ name: "X-LG", key: "xlarge" },
		];
		let soda_prices_html = soda_prices.map( ( soda_price, index ) => {
			return (
				<div class="item" key={ index }>
					<div class="title">{ soda_price.name }</div>
					{ this.priceInputHtml( prices.sodas[ soda_price.key ], tabindex++, ( event ) => {
						let new_state = { ...this.state };
							new_state.prices.sodas[ soda_price.key ] = event.target.value;
						this.setState( new_state );
					} ) }
				</div>
			);
		});

		let other_drinks = [
			{ name: "Shakes", key: "shake" },
			{ name: "Milk", key: "milk" },
			{ name: "Coffee", key: "coffee" },
			{ name: "Hot Cocoa", key: "cocoa" },
		];
		let other_drinks_html = other_drinks.map( ( other_drink, index ) => {
			return (
				<div class="item" key={ index }>
					<div class="title">{ other_drink.name.toUpperCase() }</div>
					{ this.priceInputHtml( prices.other_drinks[ other_drink.key ], tabindex++, ( event ) => {
						let new_state = { ...this.state };
							new_state.prices.other_drinks[ other_drink.key ] = event.target.value;
						this.setState( new_state );
					} ) }
				</div>
			);
		});

		let camera_html;
		if ( ! this.state.allow_camera ) {
			camera_html = (
				<div class="item">
					<div class="button" onClick={ () => this.setState({ allow_camera: true }) }>
						<div class="text">Take Photo of Menu</div>
						<div class="icon">
							<img src="/img/camera_icon.svg" />
						</div>
					</div>
				</div>
			)
		}
		else if ( this.state.allow_camera && ! this.state.menu_image.length ) {
			camera_html = (
				<div class="item">
					<Webcam
						audio={ false }
						height={ "auto" }
						ref={ this.setWebcamRef }
						screenshotFormat="image/jpeg"
						width={ "auto" }
						videoConstraints={ videoConstraints }
					/>
					<div class="button" onClick={ this.capture }><div class="text">Capture photo</div></div>
				</div>
			)
		}
		else if ( this.state.allow_camera && this.state.menu_image.length ) {
			camera_html = (
				<div class="item">
					<img src={ this.state.menu_image } />
				</div>
			)
		}

		return (
			<div>
				<Geolocation ref={ this.getGeolocationInnerRef } handler={ this.geolocationHandler } />
				<TopNav title="Price Logger (beta)" showBackButton={ false } />
				<Error messages={ errors } />
				<Success messages={ successes } />
				<div class="container" id="price_logger">
					<div class="section camera">
						{ camera_html }
					</div>
					<div class="section options">
						<div class="item">
							<div class="title inline_block">
								Date: 
							</div>
							<div class="input">
								<input type="date" defaultValue={ date.toISOString().substr( 0, 10 ) } tabIndex="1" />
							</div>
						</div>
						<div class="item select">
							<div class="title inline_block">Store: </div>
							<Select
								tabIndex="2"
								value={ this.state.store }
								onChange={ this.setStore }
								options={ this.getStoresOptions() }
								placeholder="select your store"
								autosize={ false }
							/>
							<div class="button" onClick={ () => { this.enableGeoLocation() } }>
								<div class="text">Find Closest Store</div>
								<div class="icon"><img src="/img/location_icon.svg" /></div>
							</div>
						</div>
					</div>
					<div class="section">
						<div class="ino_menu">
							<div class="burgers">
								{ burgers_html }
							</div>
							<div class="drinks">
								<div class="sodas">
									<div class="names_wrap">
										<div class="names">
											<div class="column">{ sodas_row_1 }</div>
											<div class="column">{ sodas_row_2 }</div>
										</div>
										<div class="prices">
											{ soda_prices_html }
										</div>
									</div>
								</div>
								<div class="other_drinks">
									{ other_drinks_html }
								</div>
							</div>
						</div>
					</div>
					<div class="section options">
						<div class="item">
							<div class="submit" tabIndex={ ++tabindex } onClick={ this.savePrice }>
								Save
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default PriceLogger;