"use strict";

import {App} from "lobenton/client";
import React from "react";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
import ErrorView from "src/client/containers/error/view";
import IndexView from "src/client/containers/index/view";
import WageView from "src/client/containers/wage/view";

export const ts = 1471946099130;
export default function createRouter() {
	return (
		<Router history={browserHistory}>
			<Route path="/" component={App}>
				<Route path="/error/msg" component={ErrorView} login={true} method="GET" />
				<Route path="/error/404" component={ErrorView} login={true} method="GET" />
				<Route path="/error/500" component={ErrorView} login={true} method="GET" />
				<IndexRoute component={IndexView} login={true} method="GET" />
				<Route path="/:pid" component={IndexView} login={true} method="GET" />
				<Route path="/profile/:pid" component={IndexView} login={true} method="GET" />
				<Route path="/index/index" component={IndexView} login={true} method="GET" />
				<Route path="/index/view" component={IndexView} login={true} method="GET" />
				<Route path="/wage/:cat/view" component={WageView} login={false} method="GET" />
				<Route path="/test/:cat/view" component={WageView} login={false} method="GET" />
				<Route path="/test/:cat/view/:aid" component={WageView} login={false} method="GET" />
				<Route path="/wage/:cat/report" component={WageView} login={false} method="GET" />
			</Route>
		</Router>
	);
};