import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import LandingApp from "./LandingApp";
import { ENV } from "../environments/environment";

console.log(ENV);

ReactDOM.render(<LandingApp />, document.getElementById("root"));
