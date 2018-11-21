import { combineReducers } from "redux"

import authCheck from "./authCheckReducer"
import account from "./accountReducer"
import users from "./usersReducer"
import userReceipts from "./userReceiptsReducer"
import userStores from "./userStoresReducer"
import userDriveThru from "./userDriveThruReducer"
import adminFetchApprovals from "./adminFetchApprovalsReducer"
import overlayStore from "./storeReducer"
import userMapStores from "./userMapStoresReducer"
import storesList from "./storesListReducer"
import storePrice from "./storePriceReducer"
import saveStorePrice from "./saveStorePriceReducer"
import storeClosest from "./storeClosestReducer"
import adminUpdateReceipt from "./adminUpdateReceiptReducer"
import adminUpdateUser from "./adminUpdateUserReducer"
import adminTweetUser from "./adminTweetUserReducer"

export default combineReducers({
	account,
	authCheck,
	users,
	userReceipts,
	userStores,
	userDriveThru,
	adminFetchApprovals,
	overlayStore,
	userMapStores,
	storesList,
	storePrice,
	saveStorePrice,
	storeClosest,
	adminUpdateReceipt,
	adminUpdateUser,
	adminTweetUser,
})
