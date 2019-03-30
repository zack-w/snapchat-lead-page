
import React, { PureComponent } from "react";
import { createBrowserHistory } from "history";
import toRegex from 'path-to-regexp';
import { mainAppComponent } from "./App";
import Error404 from "./components/404";
import Dashboard from "./components/dashboard/Dashboard";
import Campaign from "./components/campaigns/Campaign";

const history = createBrowserHistory();

/*
	The actual page routes...
*/
export const routes = [
	{path: '/campaign/:campaignId', draw: (params) => <Campaign params={params} />},
	{path: '/', draw: () => <Dashboard />},
];

/*
	The code to make the routing functional....
	sorry react-router, we're not good enough for you :*(
*/
const routeParamCache = {};

function matchURI(path, uri) {
	const keys = [];
	const pattern = toRegex(path, keys);
	const match = pattern.exec(uri);

	// If there is no match..
	if (!match) return null;

	// Inject all the params based off the matching
	const params = {};

	for (let i = 1; i < match.length; i++) {
		params[keys[i - 1].name] =
			match[i] !== undefined ? match[i] : undefined;
	}

	routeParamCache[uri] = params;

	return params;
}

export async function resolve() {
	// Go through provided routes
	for (const route of routes) {
		const uri = location.pathname;

		// Attempt to locatethe matching route
		const params = matchURI(route.path, uri);
		if (!params) continue;
		
		// We found the route
		return {
			route,
			params
		};
	}

	// Route not found
	return {
		path: location.pathname,
		component: () => <Error404 />
	};
}

// Call whenever the page should navigate
export var navigate = function(event) {
	event.preventDefault();

	history.push({
		pathname: event.currentTarget.pathname,
		search: event.currentTarget.search
	});

	/*
		Note, no actual navigation or updating needed here
		as it updating the history will send a trigger to the
		history listener which will handle updating.
	*/
}

// Listen for changes to the history (forward and back)
const unlisten = history.listen(async (location, action) => {
	// Update the main component
	mainAppComponent.setState({
		activatedRoute: (await resolve())
	});
});

