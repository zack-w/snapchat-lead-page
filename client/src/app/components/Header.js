import React, { PureComponent } from "react";
import "./Headers.scss";

class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <header>
        <img src="https://cdn.shopify.com/s/files/1/0046/5823/3459/files/unagi_logo_170x@2x.png?v=1548467786" />
      </header>
    );
  }
}

export default Header;
