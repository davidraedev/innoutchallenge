import React from "react"
import { connect } from "react-redux"
import { createGoogleMapsLink } from "./Utils"

import { fetchStoreInfo } from "../actions/storeActions"

require( "../less/StoreOverlay.less" )

@connect( ( store ) => {
	return {
		store: store.overlayStore,
	}
})

export default class StoreOverlay extends React.Component {

	componentWillMount() {
		this.setState({
			display: ( this.props.number ),
			number: null,
		})
	}

	hideOverlay( target, className ) {

		if ( target.className !== className && target.className !== className )
			return;

		this.setState({
			display: false,
		})
	}

	componentWillReceiveProps( new_props ) {
		if ( new_props.number ) {

			if ( new_props.number !== this.state.number ) {
				this.setState({
					number: new_props.number,
				})
				this.props.dispatch( fetchStoreInfo( this.props.dispatch, new_props.number ) )
			}
			else {
				this.setState({
					display: true,
				})
			}
		}
	}

	formatHourNumber( hour, type ) {

		let hour_string = String( hour );

		let meridian; 
		if ( type === "start" )
			meridian = ( hour <= 1159 ) ? "am" : "pm";
		else
			meridian = ( hour >= 200 && hour <= 1159 ) ? "pm" : "am";

		let number_parts = hour_string.split( "" );
		let colon_pos = ( number_parts.length === 3 ) ? 1 : 2;
		number_parts.splice( colon_pos, 0, ":" );
		return number_parts.join( "" ) + " " + meridian;
	}

	formatHourString( start, end ) {
		return this.formatHourNumber( start, "start" ) + " - " + this.formatHourNumber( end, "end" );
	}

	hoursHtml( data, exists ) {

		let html = (
			<div class="group">
				<div class="column">
					<div>None at this store</div>
				</div>
			</div>
		);

		console.log( data )

		// unknown store configuration
		if ( data.monday.manual ) {
			html = (
				<div class="group">
					<div class="column">
						<div>Unknown Hours</div>
					</div>
				</div>
			)
		}
		else if ( exists ) {
			html = (
				<div class="group">
					<div class="column">
						<div class="day">Sun - Thu:</div>
						<div class="day">Fri - Sat:</div>
					</div>
					<div class="column">
						<div class="hour">{ this.formatHourString( data.monday.start, data.monday.end ) }</div>
						<div class="hour">{ this.formatHourString( data.friday.start, data.friday.end ) }</div>
					</div>
				</div>
			)
		}

		return html;
	}

	render() {

		const { number, position, store } = this.props;
		let store_number = number || 0;
		let location = store.store.location

		let instore_hours = this.hoursHtml( store.store.dining_room_hours, store.store.dining_room );
		let drive_thru_hours = this.hoursHtml( store.store.drive_thru_hours, store.store.drive_thru );

		let number_words = [ "one", "two", "three", "four" ];
		let store_number_class = number_words[ store_number.toString().length - 1 ] + "_digits";

		let content = null;
		if ( this.state.display ) {
			content = (
				<div>
					<div class="store_overlay_background" onClickCapture={ ( event ) => { this.hideOverlay( event.target, "store_overlay_background" ); } }></div>
					<div class="store_overlay" onClickCapture={ ( event ) => { this.hideOverlay( event.target, "store_overlay" ); } }>
						<div class="outer container" style={{
							marginTop: ( position + 40 ) + "px",
						}}>

							<div class="inner container">

								<div class="number_container">
									<div class="background"></div>
									<div class={ "number " + store_number_class }>{ number }</div>
								</div>

								<div class="address_container">
									<a class="address" href={ createGoogleMapsLink( [ location.address, location.city, location.state, location.zipcode ].join(" ") ) } target="_blank">
										<p>{ location.address }</p>
										<p>{ location.city }, { location.state } { location.zipcode }</p>
									</a>
								</div>

								<div class="hours_container">

									<div class="hours">
										<div class="title">Dining Room</div>
										{ instore_hours }
									</div>

									<div class="hours">
										<div class="title">Drive-Thru</div>
										{ drive_thru_hours }
									</div>

								</div>

							</div>

							<div class="title">
								<div class="text">
									<p>S</p>
									<p>T</p>
									<p>O</p>
									<p>R</p>
									<p>E</p>
								</div>
							</div>

						</div>

					</div>

				</div>
			)
		}

		return content;
	}
}