import { combineReducers } from "redux"

import authCheck from "./authCheckReducer"
import account from "./accountReducer"
import users from "./usersReducer"
import userReceipts from "./userReceiptsReducer"
import userStores from "./userStoresReducer"
import userDriveThru from "./userDriveThruReducer"
import admin from "./adminReducer"
import overlayStore from "./storeReducer"
import userMapStores from "./userMapStoresReducer"
import storesListReducer from "./storesListReducer"
import storePriceReducer from "./storePriceReducer"
import saveStorePriceReducer from "./saveStorePriceReducer"

export default combineReducers({
	account,
	authCheck,
	users,
	userReceipts,
	userStores,
	userDriveThru,
	admin,
	overlayStore,
	userMapStores,
	storesListReducer,
	storePriceReducer,
	saveStorePriceReducer,
})
