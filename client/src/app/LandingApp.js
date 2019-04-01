import React, { PureComponent } from "react";
import Header from "./landing-components/Header";
import Form from "./landing-components/Form";
import Landing from "./landing-components/Landing";
import Complete from "./landing-components/Complete";

const axios = require('axios');

export var DYNAMIC_STYLING = {
  _v: -1,
  font: "Titillium Web",
  header: {
      backgroundColor: "#FFFFFF",
      logoUrl: "https://cdn.shopify.com/s/files/1/0046/5823/3459/files/unagi_logo_170x@2x.png?v=1548467786"
  },
  content: {
      landingTitleText: "The first premium electric scooter just came to UMD",
      landingBodyText: "Our ambassador will meet you on campus and give you a free demo. No strings attached.",
      landingButtonText: "RIDE NOW",
      formTitleText: "Let's get you riding",
      formBodyText: "Once you submit this form, Ryan, our University of Maryland campus ambassador will text you to coordinate a demo."
  },
  svgColors: [],
  backgroundColor: "#FFFFFF",
  svgBase: ""
};

class LandingApp extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
      loading: true,
      error: false,
      campaign: null
    };
  }

  // I had to add some practical cs theory in here (*.*)
  setDynamicStyles(dynamicStylesTree, campaignStyleTree) {
    // Make sure both nodes are valid
    if (!dynamicStylesTree || !campaignStyleTree) {
      return;
    }

    // Go through input nodes
    Object.keys(campaignStyleTree).forEach((inKey) => {
      let inVal = campaignStyleTree[inKey];

      // If it exists in destination...
      if (dynamicStylesTree[inKey] !== undefined) {
        // If they are objects, recurse
        if (
            Array.isArray(dynamicStylesTree[inKey])
            && Array.isArray(inVal)
        ) {
            dynamicStylesTree[inKey] = inVal;
        } else if (
          typeof dynamicStylesTree[inKey] === "object"
          && typeof inVal === "object"
        ) {
          this.setDynamicStyles(dynamicStylesTree[inKey], inVal);
        } else if(
          !(typeof dynamicStylesTree[inKey] === "object")
          && !(typeof inVal === "object")
        ) {
          dynamicStylesTree[inKey] = inVal;
        }
      }
    });
  }

  updatePageBackground() {
    const styling = this.state.campaign.styling;

    this.setDynamicStyles(DYNAMIC_STYLING, styling);

    // Update the body style
    document.body.style = `
      background-image: ${styling.backgroundImage};
      background-color: #${styling.backgroundColor};
      font-family: ${DYNAMIC_STYLING.font}, sans-serif;
    `;

    // Load the fonts
    WebFont.load({
        google: {
            families: [`${DYNAMIC_STYLING.font}:200,300,400,500,600,700,800,900`]
        }
    });
    this.forceUpdate();
  }

  async componentDidMount() {
    try {
			// Fetch the campaign
			let res = await axios.get("http://71.178.191.244:4000/campaigns/1");

			// We got the data
			this.setState({
        error: false,
        loading: false,
        campaign: res.data
      });

      console.log(res.data);
      this.updatePageBackground(res.data);
		} catch(ex) {
			console.log("ERROR");
			console.log(ex);
		}
  }

  render() {
    // If it's loading...
    if (this.state.loading || this.state.campaign == null) {
      return (
        <div>
          Loading...
        </div>
      )
    };

    return (
      <div style={{paddingBottom: 20}}>
        <Header />
        
        {
          this.state.showForm
          ? <Form />
          : <Landing onSubmit={() => this.setState({showForm: true})}/>
        }
      </div>
    );
  }
}
export default LandingApp;
