import React, { PureComponent } from "react";
import "./Form.scss";

class Form extends PureComponent {
  constructor(props) {
	super(props);
	
	this.state = {
		name: "",
		phone: "",
		email: ""
	};
  }

  isFieldValid(fieldName) {
	  if (fieldName == "phone") {
		return (this.state[fieldName].length == 10);
	  }

	  if (this.state[fieldName].length > 2) {
		return true;
	  }
  }

  render() {
    return (
		<div>
			<h2>
				Let's get you riding
			</h2>

			<div className="ambassadorPreview">
				<div className="image">
					<img src="https://i.imgur.com/5Jqzopx.png" />
				</div>

				<div className="info">
					<div>
						<b>Zachary Wynegar</b>
						<br />
						UMD Ambassador
						<br />
						Senior, Class of 2020
					</div>
				</div>
			</div>

			<p>
				Once you submit this form, Ryan, our University of Maryland
				campus ambassador will text you to coordinate a demo.
			</p>

			<div className="form-wrapper">
				<div className="form-field">
					<div className="label">Your Name</div>
					<div className="inputDiv">
						{ !this.isFieldValid("name") && <img src="assets/img/danger.svg" className="incomplete" /> }
						<input type="text" name="name" autoComplete="name" onChange={(event) => {this.setState({"name": event.target.value})}} />
					</div>
				</div>

				<div className="form-field">
					<div className="label">Phone Number</div>
					<div className="inputDiv">
						{ !this.isFieldValid("phone") && <img src="assets/img/danger.svg" className="incomplete" /> }
						<input type="tel" name="phone" autoComplete="phone" onChange={(event) => {this.setState({"phone": event.target.value})}} />
					</div>
				</div>

				<div className="form-field">
					<div className="label">Email Address</div>
					<div className="inputDiv">
						{ !this.isFieldValid("email") && <img src="assets/img/danger.svg" className="incomplete" /> }
						<input type="text" name="email" autoComplete="email" onChange={(event) => {this.setState({"email": event.target.value})}} />
					</div>
				</div>

				<div className="callToActionWrapper">
					<button onClick={() => this.onSubmit()}>
						SUBMIT
					</button>
				</div>
			</div>
		</div>
    );
  }
}

export default Form;
