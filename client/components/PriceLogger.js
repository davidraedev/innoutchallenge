import React from "react"
import { connect } from "react-redux"

//import { fetchAccount, changeSetting, deleteAccount } from "../actions/accountActions"

//import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
//import PageNotFound from "./PageNotFound"
//import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/PriceLogger.less" )
/*
@connect( ( store ) => {
	console.log( "store", store )
	return {
		stores: store.stores,
	}
})
*/
export default class PriceLogger extends React.Component {

	componentWillMount() {
		//this.props.dispatch( fetchAccount( this.props.dispatch ) )

		//this.changeSettingHandler = this.changeSettingHandler.bind( this )
		//this.deleteAccountHandler = this.deleteAccountHandler.bind( this )
	}

	render() {

		//const { account, error } = this.props;
		let date = new Date();
		let date_formatted = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

		let burgers = [
			{
				name: "Double-Double",
			},{
				name: "Cheeseburger",
			},{
				name: "Hamburger",
			},{
				name: "French Fries",
			},
		];
		let burgers_html = burgers.map( ( burger ) => {
			return (
				<div class="item">
					<div class="title">{ burger.name.toUpperCase() }</div>
					<div class="price">
						$<div class="input">
							<input type="number" placeholder="1.00" />
						</div>
					</div>
				</div>
			)
		});

		let other_drinks = [
			{ name: "Shakes" },
			{ name: "Milk" },
			{ name: "Coffee" },
			{ name: "Hot Cocoa" },
		];
		let other_drinks_html = other_drinks.map( ( other_drink ) => {
			return (
				<div class="item">
					<div class="title">{ other_drink.name.toUpperCase() }</div>
					<div class="price">
						<div class="input">
							$<input type="number" placeholder="1.00" />
						</div>
					</div>
				</div>
			);
		});

		let sodas = [
			{ name: "Coke" },
			{ name: "Root Beer" },
			{ name: "Lemonade" },
			{ name: "Iced Tea" },
			{ name: "Seven-Up" },
			{ name: "Dr Pepper" },
		];
		let sodas_html = sodas.map( ( soda ) => {
			return (
				<div class="soda">{ soda.name.toUpperCase() }</div>
			);
		});

		let soda_prices = [
			{ name: "SM" },
			{ name: "MED" },
			{ name: "LG" },
			{ name: "X-LG" },
		];
		let soda_prices_html = soda_prices.map( ( soda_price ) => {
			return (
				<div class="item">
					<div class="title">{ soda_price.name }</div>
					<div class="price">
						<div class="input">
							$<input type="number" placeholder="1.00" />
						</div>
					</div>
				</div>
			);
		});

		return	(
			<div>
				<TopNav title="Price Logger" showBackButton={ false } />
				<div class="container" id="price_logger">
					<div class="section options">
						<div>
							Date: <div class="input">
								<input type="date" value={ date_formatted } />
							</div>
						</div>
						<div>
							Store: <div class="input">
								<input type="number" placeholder="0" />
							</div>
						</div>
					</div>
					<div class="section">
						<div class="ino_menu">
							<div class="burgers">
								{ burgers_html }
							</div>
							<div class="middle">
								<div class="item top"></div>
								<div class="item bottom"></div>
							</div>
							<div class="drinks">
								<div class="sodas">
									{ sodas_html }
									<div class="prices">
										{ soda_prices_html }
									</div>
								</div>
								{ other_drinks_html }
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}