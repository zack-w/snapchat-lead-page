import React, { PureComponent } from "react";
import "./Headers.scss";
import { DYNAMIC_STYLING } from "../LandingApp";

let _renderedStyleVersion = -1;

class Header extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate() {
    if (_renderedStyleVersion !== DYNAMIC_STYLING._v) {
      return true;
    }
  }

  render() {
    _renderedStyleVersion = DYNAMIC_STYLING._v;

    return (
      <header style={{
        backgroundColor: DYNAMIC_STYLING.header.backgroundColor
      }}>
        <img src={DYNAMIC_STYLING.header.logoUrl} />
      </header>
    );
  }
}

export default Header;
