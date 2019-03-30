import React, { PureComponent } from "react";
import Header from "./components/Header";

import './App.scss';

import CampaignsListing from "./components/campaigns/CampaignsListing";
import Dashboard from "./components/dashboard/Dashboard";
import { navigate, routes, resolve } from "./router";
import axios from "axios";

let workingPath = location.pathname;

export const API_URL = "http://localhost:4000";

export var mainAppComponent = null;

axios.defaults.headers.common = {
  "Authorization": "Bearer KkShlT42DKxZlsAl",
};

class App extends PureComponent {
  constructor(props) {
    super(props);
    mainAppComponent = this;

    // Initialize the state
    this.state = {
      activatedRoute: {
        path: location.pathname,
        draw: () => "Loading..."
      }
    };

    this.fetchInitialRoute();
  }

  async fetchInitialRoute() {
    this.setState({
      activatedRoute: await resolve()
    })
  }

  render() {
    // Get the route
    return (
      <div style={{paddingBottom: 20}}>
        <Header />

        <div className="mainWrapper">
          {
            this.state.activatedRoute.route
            && this.state.activatedRoute.route.draw(this.state.activatedRoute.params)
          }
        </div>
      </div>
    );
  }
}

export default App;
