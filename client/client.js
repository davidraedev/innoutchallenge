import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

import { BrowserRouter as Router, Route, browserHistory, Switch, Redirect } from "react-router-dom"

import AuthCheck from "./components/AuthCheck"

import PrivateRoute from "./components/PrivateRoute"
import Splash from "./components/Splash"
import Account from "./components/Account"
import AccountReceipts from "./components/AccountReceipts"
import Users from "./components/Users"
import SearchUsers from "./components/SearchUsers"
import UserReceipts from "./components/UserReceipts"
import UserStores from "./components/UserStores"
import UserDriveThru from "./components/UserDriveThru"
import PageNotFound from "./components/PageNotFound"
import AdminAuth from "./components/AdminAuth"
import AdminApprovals from "./components/AdminApprovals"
import UserAuth from "./components/UserAuth"
import BackendPassThru from "./components/BackendPassThru"
import Map from "./components/Map"
import PriceLogger from "./components/PriceLogger"
import store from "./store"

require( "./less/main.less" )

const app = document.getElementById( "app" );

ReactDOM.render(
	<div>
		<Provider store={ store }>
			<Router history={ browserHistory }>
				<div>
					<AuthCheck></AuthCheck>
					<Switch>
						<Route path="/@:user(\w+)/stores" exact component={ UserStores } />
						<Route path="/@:user(\w+)/receipts" exact component={ UserReceipts } />
						<Route path="/@:user(\w+)/drivethru" exact component={ UserDriveThru } />
						<Route path="/@:user(\w+)/map" exact component={ Map } />
						<Redirect from="/@:user(\w+)" to={ document.location.pathname + "/receipts" } exact />
						<PrivateRoute path="/account/settings" component={ Account } exact />
						<PrivateRoute path="/account/receipts" component={ AccountReceipts } exact />
						<Redirect from="/account" to="/account/settings" exact />
						<Route path="/" component={ Splash } exact />
						<Route path="/search" component={ SearchUsers } exact />
						<Redirect from="/challengers/0" to="/challengers" exact />
						<Redirect from="/challengers/1" to="/challengers" exact />
						<Route path="/challengers/:page(\d+)" exact component={ Users } />
						<Route path="/challengers" component={ Users } exact />
						<Route path="/signin" exact component={ UserAuth } />
						<PrivateRoute path="/admin/approvals" exact component={ AdminApprovals } admin={ true } />
						<Redirect from="/admin" to="/admin/approvals" exact />
						<Route path="/admin/signin" exact component={ AdminAuth } />
						<Route path="/admin/signin/return/:returnUrl" exact component={ BackendPassThru } />
						<Route path="/admin/signout" exact component={ BackendPassThru } />
						<Route path="/admin/auth/twitter/callback" exact component={ BackendPassThru } />
						<Route path="/prices/add" exact component={ PriceLogger } />
						<Redirect from="/prices" to="/prices/add" exact />
						<Route path="/img/*" exact component={ BackendPassThru } />
						<Route path="/404" exact component={ PageNotFound } />
					</Switch>
				</div>
			</Router>
		</Provider>
	</div>
, app )