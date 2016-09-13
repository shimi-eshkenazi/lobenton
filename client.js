"use strict";

exports.App = require("./lib/client/components/App.js").default;
exports.WrapComponent = require("./lib/client/components/WrapComponent.js").default;
exports.actions = {
	language : require("./lib/client/actions/language.js")
};
exports.reducers = {
	history : require("./lib/client/reducers/history.js").default,
	language : require("./lib/client/reducers/language.js").default
};
exports.ConfigureStore = require("./lib/client/store/ConfigureStore.js").default;
exports.CookieUtil = require("./lib/utils/CookieUtil.js");