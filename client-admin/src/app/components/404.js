import React, { PureComponent } from "react";
import "./Landing.scss";

class Error404 extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
		<div>
			Page not found
		</div>
    );
  }
}

export default Error404;