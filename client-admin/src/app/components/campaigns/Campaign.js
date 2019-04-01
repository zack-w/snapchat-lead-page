import React, { PureComponent } from "react";
import "./Campaign.scss";
import ElementNavButton from "../shared/ElementNavButton";
import HashLoader from 'react-spinners/HashLoader';
import * as axios from "axios";
import { SketchPicker } from 'react-color';
import { API_URL } from "../../App";
import ColorPickerButton from "../shared/ColorPickerButton";
import TabNavigator from "../shared/TabNavigator";
import CampaignDesign from "./CampaignDesign";
import CampaignIntegrations from "./CampaignIntegrations";
import CampaignSummary from "./CampaignSummary";
import CampaignContent from "./CampaignContent";

export var DYNAMIC_STYLING = {
    _v: -1,
    font: "",
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
    backgroundImage: "",
    backgroundColor: "#FFFFFF",
    svgBase: ""
};

class Campaign extends PureComponent {
  constructor(props) {
	super(props);
	
    this.state = {
        loading: true,
        validatedLoading: false,
		campaignId: null,
        campaign: {}
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

    // Bump version for change detection
    DYNAMIC_STYLING._v++;
  }

    async loadCampaign(campaignId) {
        try {
            let res = await axios.get(`${API_URL}/campaigns/${campaignId}?full=true`);

            // Update the state
            this.setState({
                loading: false,
                campaign: res.data
            });

            // Update the local SVG rendering temporarily
            if (res.data.styling) {
                // Update dynamic styles
                this.setDynamicStyles(DYNAMIC_STYLING, res.data.styling);

                WebFont.load({
                    google: {
                        families: [`${DYNAMIC_STYLING.font}:200,300,400,500,600,700,800,900`]
                    }
                });

                this.setState({validatedLoading: true});
            }
        } catch(ex) {
            console.log("ERROR");
            console.log(ex);
        }
    }

  componentDidMount() {
	  if (
			this.props.params
			&& this.props.params.campaignId
			&& this.props.params.campaignId != this.state.campaignId
		) {
			this.setState({
				campaignId: this.props.params.campaignId
			})

			this.loadCampaign(this.props.params.campaignId);
		}
    }
    
    async saveStyleChanges() {
        // If we didn't validate loading...
        if (!this.state.validatedLoading || DYNAMIC_STYLING._v == -1) {
            return false;
        }

        // Make the request
        try {
            await axios.put(`${API_URL}/campaigns/${this.state.campaignId}`, {
                styling: DYNAMIC_STYLING
            });

            this.reloadDemo();
        } catch(ex) {
            console.log("ERROR");
            console.log(ex);
        }
    }

    reloadDemo() {
        this.refs.demoiFrame.src = this.refs.demoiFrame.src;
    }

    createNavigation() {
        return (
            <TabNavigator
                pages={[
                    {
                        title: "Summary",
                        image: "/assets/img/dashboard.svg",
                        draw: () => {
                            return (
                                <CampaignSummary
                                    campaignId={this.state.campaignId}
                                    campaign={this.state.campaign}
                                />
                            );
                        }
                    },
                    {
                        title: "Content",
                        image: "/assets/img/document.svg",
                        draw: () => {
                            return (
                                <CampaignContent
                                    campaignId={this.state.campaignId}
                                    campaign={this.state.campaign}
                                    saveStyleChanges={() => this.saveStyleChanges()}
                                />
                            );
                        }
                    },
                    {
                        title: "Design",
                        image: "/assets/img/paint.svg",
                        draw: () => {
                            return (
                                <CampaignDesign
                                    saveStyleChanges={() => this.saveStyleChanges()}
                                    DYNAMIC_STYLING={DYNAMIC_STYLING}
                                />
                            );
                        }
                    },
                    {
                        title: "Integrate",
                        image: "/assets/img/cog-skinny.svg",
                        draw: () => {
                            return (
                                <CampaignIntegrations />
                            );
                        }
                    },
                ]}
            />
        );
    }

  render() {
    let params = this.props.params ? this.props.params : {};

    // If we are loading
    if (this.state.loading || !this.state.campaign) {
        return (
            <div style={{marginTop: "20vh"}}>
                <HashLoader
                    css={{left: '50%', marginLeft: '-50px'}}
                    sizeUnit={"px"}
                    size={100}
                    color={'#0a75c1'}
                    loading={this.state.loading}
                />
            </div>
        );
    }

    return (
    <div style={{position: "relative"}}>
        <div className="phoneHeader">
            <h3>LIVE DEMO</h3>
            
            <div>
                <button onClick={() => this.reloadDemo()}>Reload</button>
            </div>
        </div>

        <img className="phoneBackdrop" src="https://i.imgur.com/TEO3xTX.png" />
        <iframe ref="demoiFrame" src="http://71.178.191.244:8080/" className="iPhone6S"></iframe>

        <div className="leftPanel">
            {this.createNavigation()}
        </div>
    </div>
    );
  }
}

export default Campaign;

