import React, { PureComponent } from "react";
import "./Campaign.scss";
import ElementNavButton from "../shared/ElementNavButton";
import HashLoader from 'react-spinners/HashLoader';
import * as axios from "axios";
import * as chroma from "chroma-js";
import { SketchPicker } from 'react-color';
import { API_URL } from "../../App";
import ColorPickerButton from "../shared/ColorPickerButton";
import FontPicker from "../shared/FontPicker";
import FontManager from "font-picker/dist/font-manager/font-manager/FontManager";

export var DYNAMIC_STYLING = {
    _v: 1,
    font: "",
    header: {
        backgroundColor: "#FFFFFF",
        logoUrl: "https://cdn.shopify.com/s/files/1/0046/5823/3459/files/unagi_logo_170x@2x.png?v=1548467786"
    }
};

class Campaign extends PureComponent {
  constructor(props) {
	super(props);
	
    this.state = {
        loading: true,
        validatedLoading: false,
		campaignId: null,
        campaign: {},
        backgroundSelectedColor: 0,
        backgroundColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF']
    };

    selectBG();
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

    console.log("Campaign Style Tree: ");
    console.log(campaignStyleTree);

    console.log("Dynamic Styling: " );
    console.log(DYNAMIC_STYLING);

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
                if (res.data.styling.svgColors) {
                    this.setState({
                        backgroundColors: res.data.styling.svgColors
                    });
                    
                    for (let i = 0; res.data.styling.svgColors.length > i; i++) {
                        updateColor(i + 1, res.data.styling.svgColors[i].replace('#', ''));
                    }
                }

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
        if (!this.state.validatedLoading) {
            return false;
        }

        // Make the request
        try {
            // Create the styling variable
            var styling =  Object.assign({}, DYNAMIC_STYLING);

            Object.assign(styling, {
                backgroundImage: getCode(),
                backgroundColor: (this.state.backgroundColors[0].replace('#', '')),
                svgColors: this.state.backgroundColors,
                svgBase: BG_IMGT
            });

            await axios.put(`${API_URL}/campaigns/${this.state.campaignId}`, {
                styling
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

        <img class="phoneBackdrop" src="https://i.imgur.com/TEO3xTX.png" />
        <iframe ref="demoiFrame" src="http://localhost:8080/" className="iPhone6S"></iframe>

        <div className="leftPanel">
            <div className="tabNav simplePanel">
                <div>
                    <a>
                        <img src="/assets/img/dashboard.svg" />
                        <br />
                        Summary
                    </a>
                    <div className="bottomBar">&nbsp;</div>
                </div>

                <div>
                    <a>
                        <img src="/assets/img/paintbrush-outline.svg" />
                        <br />
                        Design
                    </a>
                    <div className="bottomBar">&nbsp;</div>
                </div>

                <div>
                    <a>
                        <img src="/assets/img/two-settings-cogwheels.svg" />
                        <br />
                        Integrate
                    </a>
                    <div className="bottomBar">&nbsp;</div>
                </div>
            </div>

            <h3>FIELDS COLLECTED</h3>

            <div>
                <button>Add Field</button>
            </div>

            <div className="simplePanel" style={{maxWidth: "500px", marginTop: 20}}>
                {
                    (this.state.campaign.fields.length > 0) && (
                        this.state.campaign.fields.map((field) => {
                            return (
                                <div className="element">
                                    {field.key}
                                </div>
                            );
                        })
                    )
                }
            </div>

            <br />

            <h3>PAGE STYLES</h3>

            <div className="simplePanel" style={{maxWidth: "500px", marginTop: 0}}>
                <FontPicker
                    activeFontFamily={DYNAMIC_STYLING.font}
                    onChange={nextFont => {
                        if (nextFont) {
                            let f = (typeof nextFont == "object" ? nextFont.family : nextFont);
                            if (f == "") return;
                            DYNAMIC_STYLING.font = (typeof nextFont == "object" ? nextFont.family : nextFont);
                            this.saveStyleChanges();
                            this.forceUpdate();
                        }
                    }}
                />
            </div>

            <br />

            <h3>BACKGROUND</h3>

            <div className="simplePanel" style={{maxWidth: "500px", marginTop: 0}}>
                <div style={{color: "#666", fontWeight: 200, fontSize: 14}}>
                    The background pattern has multiple colors. Play around with the colors below to
                    change the design in real time.
                </div>

                {
                    this.state.backgroundColors.map((color, i) => {
                        return (
                            <ColorPickerButton
                                color={color}
                                label={"Background Pattern Color"}
                                onColorChange={(color) => {
                                    // Set the background color & update
                                    this.state.backgroundColors[i] = color.hex;
                                    updateColor(i + 1, color.hex.replace('#', ''));

                                    // Upload new background
                                    this.saveStyleChanges();
                                    this.forceUpdate();
                                }}
                            />
                        );
                    })
                }
            </div>

            <br />

            <h3>HEADER</h3>

            <div className="simplePanel" style={{maxWidth: "500px", marginTop: 0}}>
                <ColorPickerButton
                    color={DYNAMIC_STYLING.header.backgroundColor}
                    label={""}
                    onColorChange={(color) => {
                        DYNAMIC_STYLING.header.backgroundColor = color.hex;
                        this.saveStyleChanges();
                        this.forceUpdate();
                    }}
                />
            </div>
        </div>
    </div>
    );
  }
}

export default Campaign;


var codeL = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1250, 1600, 4000, 2500, -5, 5, -10, 10];
var codeU = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600, 800, 1000, 2000];
var codeKey = ['a', 'b', 'c', 'd', 'e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

function screenWidth(){
    var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth;
    return x;
}
function screenHeight(){
    var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],y=w.innerHeight||e.clientHeight||g.clientHeight;
    return y;
}

var COLOR_MODE_NUMBER = 0;
var ARR_COLOR_MODE = ['lch', 'hsl', 'lab', 'rgb', 'lrgb'];
var VARIATION_STRENGTH = 0.5;
var COLOR_VARIATIONS = [   ['000','FFF'],['400','F00'],['F40', 'F90'],['A70', 'FF0'],['040','0F0'],['08F','004'],['90F', 'D0F'] ,'random'];
var COLOR_VARIATION_NAME = ["GRAY TONES","RED TONES"  ,"ORANGE TONES","YELLOW TONES","GREEN TONES","BLUE TONES" ,"PURLPLE TONES","RANDOM TONES"];
var NEW_VARIATION = true;
var ARR_VARIATION = [];
var COLOR_VARIATION_NUMBER = 1;
var USE_DEFAULT = true;
var SHOW_UI = true;
var TEST_VAR = 'X';
var BG_NAME = '';
var CTRL_CODE = '';
var AUTHOR_INFO = '';
var MODIFICATION_VERSIONS = 0;
var MODIFICATION_NUMBER = 1;

function ColorSetting (colorHex, CSSclass, typeNumber, lineNumber, variation, lightness, stepNumber) {
    this.color = colorHex;
    this.type = CSSclass;
    this.number = typeNumber;
    this.line = lineNumber;
    this.vary = variation || false;
    this.lightness = lightness || 0;
    this.step = stepNumber || 0;
}
var PALETTE = [];
//ColorList.prototype.getInfo = function() {
    //return this.color + ' ' + this.type + ' apple';
//};


function AttributeSetting (attributeValue, attributeType, lineNumber, attributeNumber) {
    this.value = attributeValue;
    this.type = attributeType;
    this.line = lineNumber; 
    this.number = attributeNumber || 0;
    this.id = attributeNumber || 0;
}

/*
function MoveSetting (lineNumber, rangeID, originalX, originalY, minX, maxX, minY, maxY) {
    this.line = lineNumber;
    this.id = rangeID;
    this.oX = originalX;
    this.oY = originalY;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
}
*/

function MoveSetting (lineNumber, rangeID, x, y, rotate, scale, origin) {
    this.line = lineNumber;
    this.id = rangeID;    
    this.x = x;
    this.y = y;
    this.rotate = rotate;
    this.scale = scale;
    this.origin = origin; //[0, 0]
}


var COLOR = ['000', 'AAA', 'FFF', '000', '444', '555', '666', '777', '888', '999'];
var BKUP_COLOR = [];
var BG_IMAGE = 'none';
var BG_ATTACHMENT = 'scroll';
var BG_REPEAT = 'repeat';
var BG_SIZE = 'auto';
var BG_POSITION = 'center';
var BG_ARRAY = [];
var COPIED_COLOR = 'F0F';
var STEP_COUNTER = [];
var ARR_POSITION = [];
var ARR_MOVE = [];
var ARR_MOVE_RANGE = [];
//var ARR_POSITION_ID = [];
//var ARR_POSITION_VALUE = [];

function resetStepCounter(){
    STEP_COUNTER = [];
    for(var i=0; i<99; i++){
        STEP_COUNTER[i] = 0;
    }
}

var ARR_SCALE = [];
var ARR_SIZE = [];
var ARR_SIZE_NUMBER = [];
var ARR_SIZE_ID = [];
var ARR_OPACITY = [];
var ARR_STROKE_WIDTH = [];
var ARR_STROKE_MULTIPLE = [];
var ARR_ANGLE = [];
var ARR_ANGLE_NUMBER = [];
var ARR_RADIAL = [];
var ARR_RADIAL_NUMBER = [];
var WIDTH = [];
var HEIGHT = [];
var PATTERN = {spin:0, span:1, line:0};
var PATTERN_LINES = [];

function resetARRAYS(){
    NEW_VARIATION = true;
    PALETTE = [];
    BKUP_COLOR = [];
    resetStepCounter();    
	COLOR_MODE_NUMBER = 0;
    ARR_POSITION = [];
    ARR_MOVE = [];
    ARR_MOVE_RANGE = [];
    //ARR_POSITION_ID = [];
    //ARR_POSITION_VALUE = [];
	ARR_ANGLE = [];
	ARR_ANGLE_NUMBER = [];
	ARR_RADIAL = [];
	ARR_RADIAL_NUMBER = [];
	ARR_SCALE = [];
	ARR_SIZE = [];
	ARR_SIZE_NUMBER = [];
	ARR_SIZE_ID = [];
	ARR_OPACITY = [];
	ARR_STROKE_WIDTH = [];
    ARR_STROKE_MULTIPLE = [];
    WIDTH = [];
    HEIGHT = [];
    PATTERN = {spin:0, span:1, line:0};
    PATTERN_LINES = [];
}

var SCALE = '';
var SCALE_MULTIPLE = '';
var SIZE_MULTIPLE = '';
var SIZE_MIN = '';
var SCALE_MIN = '';
var OPACITY = '';
var SIZE = '';
var ANGLE = '';
var RADIAL = '';
var STROKE_WIDTH = '';
var POSITION = '';
var ORIGINAL_WIDTH;
var ORIGINAL_HEIGHT;




//var COUNT = '';
//var WEIGHT = '';
//var PADDING = '';




function setupButtons(){
    var m = 1;
    var dataID = "";
    var dataCTRL = "";
    var dataCTRLmod = "";
    var dataFILTER = "";
    var dataClass = "";
    var displayHTML = "";
    var bgButtons = document.getElementById("stage").getElementsByTagName("p");
    
    for(var i = 0; i < bgButtons.length; i++){
        m = 2;
        dataID = "";
        dataCTRL = "";
        dataCTRLmod = "";
        dataFILTER = "";
        dataClass = "";
        dataID = bgButtons[i].id;
        dataCTRL = bgButtons[i].getAttribute("data-ctrl");
        while( bgButtons[i].getAttribute("data-ctrl" + m) !== null && m < 9){            
            dataCTRLmod += 'data-ctrl' + m + '="' + bgButtons[i].getAttribute("data-ctrl" + m) + '" ';
            m++;
        }
        dataFILTER = bgButtons[i].getAttribute("data-filter");
        if(bgButtons[i].classList.length > 0){
            dataClass = ' ' + bgButtons[i].className;
        }
        displayHTML += '<div class="box" id="' + dataID + '"><div class="preview">';
        displayHTML += '<a class="button bg-' + dataID + dataClass + '" href="#' + dataID + '" data-ctrl="' + dataCTRL + '" ' + dataCTRLmod + 'data-filter="' + dataFILTER + '">';
        displayHTML += '<img src="/img/placeholder.png"><div class="overlay"><p>PREVIEW</p></div></a></div></div>';    
    }
    document.getElementById("stage").innerHTML = displayHTML;
}
// setupButtons();


var SHOW_DROPDOWN = false;
var DROPDOWN_COUNT = 1;
var FILTER_TYPE = 'all';
function uiDropdown(val){    
    if(val.length > 3){
        return;
    }    
    if(val === 'opn'){
        if(SHOW_DROPDOWN){
            hideDropdown();
        }else{
            showDropdown();
        }        
    }else{
        hideDropdown();
        filterBackgrounds(val);
    }
}

const BG_IMGT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg fill-opacity='1'%3E%3Cpath fill='%23ffb100' class='steps12' d='M486 705.8c-109.3-21.8-223.4-32.2-335.3-19.4C99.5 692.1 49 703 0 719.8V800h843.8c-115.9-33.2-230.8-68.1-347.6-92.2C492.8 707.1 489.4 706.5 486 705.8z'/%3E%3Cpath fill='%23ffb800' class='steps12' d='M1600 0H0v719.8c49-16.8 99.5-27.8 150.7-33.5c111.9-12.7 226-2.4 335.3 19.4c3.4 0.7 6.8 1.4 10.2 2c116.8 24 231.7 59 347.6 92.2H1600V0z'/%3E%3Cpath fill='%23ffbe00' class='steps12' d='M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z'/%3E%3Cpath fill='%23ffc500' class='steps12' d='M0 0v429.4c55.6-18.4 113.5-27.3 171.4-27.7c102.8-0.8 203.2 22.7 299.3 54.5c3 1 5.9 2 8.9 3c183.6 62 365.7 146.1 562.4 192.1c186.7 43.7 376.3 34.4 557.9-12.6V0H0z'/%3E%3Cpath fill='%23ffcc00' class='color2' d='M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z'/%3E%3Cpath fill='%23ffd722' class='steps23' d='M1600 0H0v136.3c62.3-20.9 127.7-27.5 192.2-19.2c93.6 12.1 180.5 47.7 263.3 89.6c2.6 1.3 5.1 2.6 7.7 3.9c158.4 81.1 319.7 170.9 500.3 223.2c210.5 61 430.8 49 636.6-16.6V0z'/%3E%3Cpath fill='%23ffe135' class='steps23' d='M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z'/%3E%3Cpath fill='%23ffeb46' class='steps23' d='M1600 0H498c118.1 85.8 243.5 164.5 386.8 216.2c191.8 69.2 400 74.7 595 21.1c40.8-11.2 81.1-25.2 120.3-41.7V0z'/%3E%3Cpath fill='%23fff556' class='steps23' d='M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z'/%3E%3Cpath fill='%23ffff66' class='color3' d='M1315.3 72.4c75.3-12.6 148.9-37.1 216.8-72.4h-723C966.8 71 1144.7 101 1315.3 72.4z'/%3E%3C/g%3E%3C/svg%3E")`;
function selectBG(id, group){
    COLOR[1] = "FF0000";
    
		BG_IMAGE = BG_IMGT;
		BG_IMAGE = BG_IMAGE.replace(/\%20/g, " ");
		BG_IMAGE = BG_IMAGE.replace(/\\\'/g, "'");
		BG_IMAGE = BG_IMAGE.replace("url('data:image/svg+xml", 'url("data:image/svg+xml');
		BG_IMAGE = BG_IMAGE.replace("%3C/svg%3E')", '%3C/svg%3E")');
		BG_IMAGE = BG_IMAGE.replace("</svg>')", '</svg>")');
    
	BG_ATTACHMENT = 'fixed';
	BG_SIZE = 'cover';
  ///BG_REPEAT = window.getComputedStyle( el, null).getPropertyValue('background-repeat');    
	//BG_POSITION = window.getComputedStyle( el, null).getPropertyValue('background-position');
    /*
	if(BG_SIZE === "115%"){
	   BG_SIZE = "auto";
	}else if(BG_SIZE === "200%"){
        BG_SIZE = "cover";
    }
    
    var attribute_code = 'data-ctrl';
    CTRL_CODE = el.getAttribute(attribute_code);
    if(MODIFICATION_NUMBER > 1){
        attribute_code += MODIFICATION_NUMBER;
        if(el.getAttribute(attribute_code) !== null){
            CTRL_CODE = el.getAttribute(attribute_code);
        }
    }
	AUTHOR_INFO = el.getAttribute('data-author');  
	*/

	indexBG_Image();    
	// setControls();
    updateColor(1, COLOR[1]);
	//applyBackground(); // updating color apply's background();
}

function getAttrValue(line, attribute){
    var regEx = new RegExp(' ' + attribute + "=\\'([^']*)\\'");    
    if(BG_ARRAY[line].includes(' ' + attribute)){
        return BG_ARRAY[line].match(regEx)[1];
    }else{
        return null;
    }
}
function updateAttrValue(line, attribute, new_value){    
    var old_value = getAttrValue(line, attribute);
    //if(old_value !== null){
        var old_line = ' ' + attribute + "='" + old_value + "'";
        var new_line = ' ' + attribute + "='" + new_value + "'";
        BG_ARRAY[line] = BG_ARRAY[line].replace(old_line, new_line);
    //}
}
function indexBG_Image(){
	resetARRAYS();
	var str = BG_IMAGE;
    var lightness = 0;
    var matches = '';
    var color_number = 0;
    var color_hex = '';
    var color_type = '';
    var step_instance = 0;
    var variation = false;
    var attributeValue = 0;
    var attributeNumber = 0;
	str = str.replace("svg+xml,", "svg+xml,|");	
	str = str.split("%3E%3C").join('%3E|%3C');
	BG_ARRAY = str.split("|");
	var l = 0;    
	while(l < BG_ARRAY.length){        
		var temp = BG_ARRAY[l];
        if(l === 1){
            if(temp.includes("viewBox")){
                var viewBox_numbers = temp.match(/viewBox=\'([0-9.%]* [0-9.%]* [0-9.%]* [0-9.%]*)\'/)[1];                
                viewBox_numbers.split('%25').join('');
                var v_num = viewBox_numbers.split(" ");         
                ORIGINAL_WIDTH = Number(v_num[2]) - Number(v_num[0]);
                ORIGINAL_HEIGHT = Number(v_num[3]) - Number(v_num[1]);
                
            }else{
                ORIGINAL_WIDTH = 0;
                ORIGINAL_HEIGHT = 0;
            }            
        }
        
        //ARR_STROKE_MULTIPLE[l] = 1;
        
		if(temp.includes("class='")){
			var tempClass = temp.match(/class=\'([^']*)\'/)[1];   //// how to target class='' or width etc.
            BG_ARRAY[l] = BG_ARRAY[l].replace(tempClass, "");
			BG_ARRAY[l] = BG_ARRAY[l].replace("class=''", "");
            
            lightness = 0;            
            if(tempClass.includes("darken") || tempClass.includes("lighten") || tempClass.includes("fade") || tempClass.includes("boost") ){   
                //matches = tempClass.match(/[dlfb][aio][rkghtdos]*[en]*([0-9]{0,2})/)[1];
                //matches = tempClass.match(/(darken|lighten|fade|boost)([0-9]{0,2})/)[1];
                //matches = tempClass.match(/(darken|lighten|fade|boost)([0-9]{0,2})/)[0];
                //var match = tempClass.match(/(darken|lighten|fade|boost)([0-9]{0,2})/)[0];
                var match_type = tempClass.match(/(darken|lighten|fade|boost)([0-9]{0,2})/)[1];
                var match_value = tempClass.match(/(darken|lighten|fade|boost)([0-9]{0,2})/)[2];
                
                
                //tempClass = tempClass.replace(matches, "");
                if(match_value === ''){
                    match_value = 100;
                }
                match_value = parseInt(match_value, 10) / 100;                
                if(match_type === "darken"){
                    lightness -= match_value; //darken -0.99 to -.01; 
                }else if(match_type === "lighten"){
                    lightness += match_value; //lighten 0.01 to 0.99; 
                }else if(match_type === "fade"){
                    lightness += match_value + 1; //fade 1.01 to 1.99, default 2;
                }else if(match_type === "boost"){
                    lightness -= (match_value + 1); //fade -1.01 to -1.99, default -2;
                }
                //console.log(match + ' ' + match_type + ' ' + match_value + ' ' + lightness);
            }
            
            if(tempClass.includes("stroke")){
                matches = tempClass.match(/stroke([0-9]{2})/)[1];
                tempClass = tempClass.replace(matches, "");
                matches = parseInt(matches, 10) / 10;                
                ARR_STROKE_MULTIPLE[l] = matches;
            }
            
            if(tempClass.includes("vary")){
                tempClass = tempClass.replace("vary", "");
                variation = true;
            }else{
                variation = false;
            }
            
            if(tempClass.includes("copy")){
                tempClass = tempClass.replace("copy", "");
                PALETTE[PALETTE.length] = new ColorSetting(COPIED_COLOR, 'copy', 0, l, variation, lightness);                
            }           
            
            if(tempClass.includes("size")){   //clean up...
                ARR_SIZE_NUMBER[ARR_SIZE.length] = tempClass.match(/(size[0-9]{1})/)[1];
                ARR_SIZE[ARR_SIZE.length] = l;
                tempClass = tempClass.replace("size", "");
            }           
            if(tempClass.includes("width")){               
                attributeNumber = tempClass.match(/width([0-9]{1})/)[1]; 
                attributeValue = temp.match(/width=\'([^']*)\'/)[1];
                WIDTH[WIDTH.length] = new AttributeSetting(attributeValue, "width", l, attributeNumber);
                tempClass = tempClass.replace("width", "");
            }            
            if(tempClass.includes("height")){   //clean up...
                attributeNumber = tempClass.match(/height([0-9]{1})/)[1];
                attributeValue = temp.match(/height=\'([^']*)\'/)[1];
                HEIGHT[HEIGHT.length] = new AttributeSetting(attributeValue, "height", l, attributeNumber);
                tempClass = tempClass.replace("height", "");
            }
            
            if(tempClass.includes("color") || tempClass.includes("steps") || tempClass.includes("blend")){                
                color_type = tempClass.match(/[a-z]*[0-9]{1,2}/)[0];
                color_number = color_type.match(/[0-9]{1,2}/);
                color_number = parseInt(color_number, 10);
                color_type = color_type.match(/[a-z]*/)[0];
                color_hex = temp.match(/\'\%23([^']*)\'/)[1];
                COPIED_COLOR = color_hex;
                if(USE_DEFAULT && color_type === "color" && color_number !== 1){
                    if(lightness === 0){
                        BKUP_COLOR[color_number] = color_hex;
                    }                    
                    if(BKUP_COLOR[color_number] === undefined){
                        COLOR[color_number] = color_hex;
                    }else{
                        COLOR[color_number] = BKUP_COLOR[color_number];
                    }
					//COLOR[color_number] = color_hex;                    
				}else if(color_type === "steps"){
                    STEP_COUNTER[color_number]++;
                    step_instance = STEP_COUNTER[color_number];
                }
                PALETTE[PALETTE.length] = new ColorSetting(color_hex, color_type, color_number, l, variation, lightness, step_instance);                
            }
		
			if(tempClass.includes("scale")){
				ARR_SCALE[ARR_SCALE.length] = l;
			}            
        
            if(tempClass.includes("position")){
                var pType = tempClass.match(/position([xyXYUDLR]*)/)[1];
                var pValue = temp.match(/d=\'(M[0-9.-]*[ ][0-9.-]*)/)[1];
                ARR_POSITION[ARR_POSITION.length] = [l, pType, pValue];
			}
            if(tempClass.includes("move")){
                //var originCode = tempClass.match(/origin([0-9a-zA-Z_])*/g);
                var mInstance = tempClass.match(/move([0-9a-zA-Z_])*/g);
                var mCode, mRange, mTemp;
                var mValues = []; //[-10,0,0,1000] ... 'move1_a_0_0_Y' ... xmin_xmax_ymin_ymax;                
                var tempVal = 0;
                var tempVals = [];
                var origin = getOrigin(l);                
                
                var i, ii, iii;
                for(i = 0; i < mInstance.length; i++){
                    mCode =  mInstance[i];
                    mRange = Number( mCode.match(/move([0-9])/)[1] );
                    mCode = mCode.replace("move" + mRange + '_', "");                
                    mValues = mCode.split("_");                    
                    for(ii = 0; ii < mValues.length; ii++){
                        tempVal = mValues[ii];
                        tempVals = tempVal.split('');
                        tempVal = 0;
                        for(iii = 0; iii < tempVals.length; iii++){
                            if(tempVals[iii] !== tempVals[iii].toUpperCase() && ii < 3){                                
                                mTemp = -getCodeValue(tempVals[iii].toUpperCase());
                            }else{
                                mTemp = getCodeValue(tempVals[iii]);
                            }                            
                            tempVal = tempVal + Number(mTemp);
                        }                        
                        mValues[ii] = tempVal;
                    }                    
                    //ARR_MOVE[ARR_MOVE.length] = new MoveSetting(l, mRange, ox, oy, mValues[0], mValues[1], mValues[2], mValues[3]);
                    ARR_MOVE[ARR_MOVE.length] = new MoveSetting (l, mRange, mValues[0], mValues[1], mValues[2], mValues[3], origin);                    
                    //console.log(1, mRange, mValues[0], mValues[1], mValues[2], mValues[3]);
                    //(line, rangeID, x, y, rotate, scale, origin)
                }
			} 
		}
		if(temp.includes("fill-opacity=") || temp.includes("stroke-opacity=")){ //avoid stop-opacity
			ARR_OPACITY[ARR_OPACITY.length] = l;
		}
		if(temp.includes("stroke-width=")){
			ARR_STROKE_WIDTH[ARR_STROKE_WIDTH.length] = l;    
		}
		if(temp.includes("%3ClinearGradient")){
			ARR_ANGLE[ARR_ANGLE.length] = l;
		}else if(temp.includes("%3CradialGradient")){
			ARR_RADIAL[ARR_RADIAL.length] = l;			
			//fx="5%" fy="5%" r="65%" Radial touches r='65%'
		}else if(temp.includes("patternTransform")){
            PATTERN.line = l;
            PATTERN_LINES[PATTERN_LINES.length] = l;
        }
		l++;
	}    
}

function getOrigin(lineNumber){
    var temp = BG_ARRAY[lineNumber];  
    var x = 0;
    var y = 0;
    var width, height, tempX, tempY, tempCode, searchFor, numbers, rOrigin;
    var rProceed = false;
    var i = 1;
    
    if(ORIGINAL_WIDTH > 0){ //get default center if possible.
        x = ORIGINAL_WIDTH / 2;
    }
    if(ORIGINAL_HEIGHT > 0){
        y = ORIGINAL_HEIGHT/ 2;
    }
    
    while( temp.includes("%3Cg") ){
        temp = BG_ARRAY[lineNumber + i];
        i++;
    }
    rOrigin = getAttrValue(lineNumber, 'transform');    
    if(rOrigin !== null){
        if(rOrigin.includes("rotate")){            
            numbers = rOrigin.match(/rotate\(([0-9 .-]+)\)/)[1];
            numbers = numbers.replace(/[-]/g, ' -').replace(/ {1,}/g," ").split(' ').map(Number);
            if(numbers.length === 3){
                x = numbers[1];
                y = numbers[2];
                rProceed = true;
            }
        }
    }
    
    if(rProceed){
        //rOrgin worked and pulled numbers from rotate(0 x y);
    }else if( temp.includes("path") || temp.includes("polygon") ){
        searchFor = 'points';
        if(temp.includes("path")){
            searchFor = 'd';
        }
        tempCode = getAttrValue(lineNumber, searchFor);        
        if( tempCode !== null){
            numbers = tempCode.match(/[0-9 .-]+/g).join('');
            numbers = numbers.replace(/[-]/g, ' -').replace(/ {1,}/g," ").split(' ').map(Number);
            x = numbers[0];
            y = numbers[1];
        }
    }else if( temp.includes("circle") || temp.includes("ellipse") ){
        x = Number( getAttrValue(lineNumber, 'cx') );
        y = Number( getAttrValue(lineNumber, 'cy') );
    }else if( temp.includes("rect") ){
        width = getAttrValue(lineNumber, 'width');
        height = getAttrValue(lineNumber, 'height');
        tempX = getAttrValue(lineNumber, 'x');
        tempY = getAttrValue(lineNumber, 'y');        
        if( width !== null && tempX !== null){
            tempX = Math.round( Number(tempX) - Number(width/2) );
            x = tempX;
        }
        if( height !== null && tempY !== null){
            tempY = Math.round( Number(tempY) - Number(height/2) );
            y = tempY;
        }
    }
    return [ Math.round(x), Math.round(y)];
}

function setControls(){
	document.getElementById('svgName').getElementsByTagName("H2")[0].innerHTML = BG_NAME;
    BG_NAME = BG_NAME.replace(" ", "-");
	var codeParts = CTRL_CODE.split("-");
	var authorParts = ["Matt Lipman", "https://twitter.com/BumpSetCreative", "Bump Set Creative", "http://bumpsetcreative.com"];
	if(AUTHOR_INFO !== null){
		authorParts = AUTHOR_INFO.split("|");	   
	}
	
	AUTHOR_INFO = 'By ';
	if(authorParts[1] !== ''){
		if(!authorParts[1].includes('http')){
			authorParts[1] = 'http://' + authorParts[3];
		}
		AUTHOR_INFO += '<a href="' + authorParts[1] + '" target="_blank">' + authorParts[0] + '</a>';
	}else{
		AUTHOR_INFO += authorParts[0];
	}
	if(authorParts[2] !== '' && authorParts.length > 2){
		AUTHOR_INFO+= ' <span class="separator">&#x2726;</span> ';
		if(authorParts[3] !== ''){
			if(!authorParts[3].includes('http')){
				authorParts[3] = 'http://' + authorParts[3];
			}
			AUTHOR_INFO += '<a href="' + authorParts[3] + '" target="_blank">' + authorParts[2] + '</a>';
		}else{
			AUTHOR_INFO += authorParts[2];
		}
	}
	document.getElementById('credits').innerHTML = AUTHOR_INFO;

	var numOfColors = codeParts[0];
	var size_part = 0;
    var width_count = 0;
    var height_count = 0;
	var arr_angle_count = 0;
	var arr_radial_count = 0;
    var varyRange = false;
	hideSliders(codeParts.length);
	
	for(var i=1;i<codeParts.length;i++){
		var range = codeParts[i];
		var rangeType = range.charAt(0);
		var rangeName = "";
		var rangeMin = 0;
		var rangeMax = 1;
		var rangeStep = 0.01;
		var rangeValue = 1;
		
		if(rangeType === "S"){
			rangeName = "SIZE";
			size_part++;
			ARR_SIZE_ID[i] = size_part;
		}else if (rangeType === "X"){
			rangeName = "SCALE";			
		}else if (rangeType === "O"){
			rangeName = "OPACITY";
        }else if (rangeType === "P"){
			rangeName = "POSITION";
            //var arr_pos_size = ARR_POSITION_VALUE.length;
            //ARR_POSITION_VALUE[arr_pos_size] = 0;
            //ARR_POSITION_ID[i] = arr_pos_size;
            POSITION = 0;            
            rangeMin = 0;
			rangeMax = 800;
			rangeStep = 1;
			rangeValue = 0;
        }else if (rangeType === "Q"){  
			rangeName = "SPIN";
            rangeMin = 0;
			rangeMax = 360;
			rangeStep = 1;
            rangeValue = 0;
		}else if (rangeType === "q"){  
			rangeName = "SPAN";
            rangeMin = 0.05;
			rangeMax = 5;
			rangeStep = 0.05;            
            rangeValue = 1;
        }else if (rangeType === "M"){  
			rangeName = "MOVE";
            rangeMin = 0;
			rangeMax = 100;
			rangeStep = 1;
            rangeValue = 0; //set this number automatically? Or reset the line to 0%
            ARR_MOVE_RANGE[ARR_MOVE_RANGE.length] = i;
		}else if (rangeType === "W"){
			rangeName = "WIDTH";
			rangeMin = 10;
			rangeMax = 1000;
			rangeStep = 1;
            rangeValue = WIDTH[width_count].value.replace('%25', '');
            WIDTH[width_count].id = i;   
            width_count++;
        }else if (rangeType === "H"){
			rangeName = "HEIGHT";            
			rangeMin = 10;
			rangeMax = 1000;
			rangeStep = 1;
            rangeValue = HEIGHT[height_count].value.replace('%25', '');
            HEIGHT[height_count].id = i;
            height_count++;
        }else if (rangeType === "C"){
			rangeName = "COUNT";
			rangeMin = 1;
			rangeMax = 20;
			rangeStep = 1;
        }else if (rangeType === "V"){
            rangeName = "VARIANCE";
            varyRange = true;
		}else if (rangeType === "K"){ //stroke-width	
			rangeName = "STROKE";
			rangeMin = 1;
			rangeMax = 20;
			rangeStep = 0.1;
			rangeValue = 1;
		}else if(rangeType === "A"){
			rangeName = "ANGLE";
			rangeMin = 0;
			rangeMax = 360;
			rangeStep = 1;
			rangeValue = 0;
			ANGLE = 0;		
			ARR_ANGLE_NUMBER[i] = arr_angle_count;
			arr_angle_count++;
		}else if(rangeType === "R"){
			rangeName = "RADIAL";
			rangeMin = 0;
			rangeMax = 100;
			rangeStep = 0.1;
			rangeValue = 50;			
			RADIAL = 50;
			ARR_RADIAL_NUMBER[i] = arr_radial_count;
			arr_radial_count++;
		}
		
		if(range.length === 2){
            if(rangeName === "POSITION"){
                rangeMax = getCodeValue(range.charAt(1));
            }else{
                rangeValue = getCodeValue(range.charAt(1));
            }			
            if(rangeName === "VARIANCE"){
               VARIATION_STRENGTH = rangeValue;
            } 
        }else if(range.length === 3 ){
            rangeMin = getCodeValue(range.charAt(1));
			rangeMax = getCodeValue(range.charAt(2));
            if(rangeName === "SPAN" && rangeMax - rangeMin < 1){
                rangeStep = 0.01;
            }
		}else if(range.length === 4 && rangeName === "SCALE"){
			SCALE_MIN = getCodeValue(range.charAt(1));
			var scale_max = getCodeValue(range.charAt(2));			
			var scale_difference = scale_max - SCALE_MIN;
			SCALE_MULTIPLE = scale_difference/100;
			rangeMin = 0;
			rangeMax = 100;
			rangeStep = 1;
			rangeValue = getCodeValue(range.charAt(3));
			
			if(rangeValue > 100){
				rangeValue = 100;
			}else if(rangeValue < 0){
				rangeValue = 0;
			}
		   	SCALE = rangeValue;
		}else if(range.length === 4 && rangeName === "SIZE"){
			SIZE_MIN = getCodeValue(range.charAt(1));
			var size_max = getCodeValue(range.charAt(2));			
			var size_difference = size_max - SIZE_MIN;
			SIZE_MULTIPLE = size_difference/100;
			rangeMin = 0;
			rangeMax = 100;
			rangeStep = 1;
			rangeValue = getCodeValue(range.charAt(3));
			
			if(rangeValue > 100){
				rangeValue = 100;
			}else if(rangeValue < 0){
				rangeValue = 0;
			}
		   	SIZE = rangeValue;
		}else if(range.length === 5 && rangeName !== "SCALE"){
			rangeMin = getCodeValue(range.charAt(1));
			rangeMax = getCodeValue(range.charAt(2));
			rangeStep = getCodeValue(range.charAt(3));
			rangeValue = getCodeValue(range.charAt(4));
		}else if(rangeName === "ANGLE" || rangeName === "RADIAL" || rangeName === "SPIN" || rangeName === "SPAN" || rangeName === "MOVE"){
 
		}else if(rangeName === "OPACITY" || rangeName === "STROKE"){
			if(range.length === 4){
				rangeMin = getCodeValue(range.charAt(1));
				rangeMax = getCodeValue(range.charAt(2));
				rangeValue = getCodeValue(range.charAt(3));
				if(rangeName === "STROKE"){
					STROKE_WIDTH = rangeValue;
				}
			}
            if(rangeMax - rangeMin < 2.1){rangeStep = 0.01;}      
		}else{
			o('Bad data-ctrl code!');
		}
		setupRange(i, rangeName, rangeMin, rangeMax, rangeStep, rangeValue);
        setupVariation(varyRange);       
	}    
	if(numOfColors.includes("F")){
		numOfColors = numOfColors.replace("F", "");
		BG_ATTACHMENT = "fixed";
	}
    if(numOfColors.includes("NR")){
		numOfColors = numOfColors.replace("NR", "");
        BG_REPEAT = 'no-repeat';
	}
    if(numOfColors.includes("PAR")){
		numOfColors = numOfColors.replace("PAR", "");
        //auto add "preserveAspectRatio='none'" to BG_ARR[1]?
        calcBackgroundSize();
        //PRESERVE_ASPECT_RATIO = false;
        //preservedAspectRatio(PRESERVE_ASPECT_RATIO);
	}
    if(numOfColors.includes("P")){
        var position_directions = numOfColors.match(/P[tbrlc]*/);        
        numOfColors = numOfColors.replace(position_directions, "");
        position_directions = String(position_directions);
        var keyletter1 = position_directions.match(/P([tbrlc])[tbrlc]/)[1];        
        var keyletter2 = position_directions.match(/P[tbrlc]([tbrlc])/)[1];
        BG_POSITION = convertKeyword(keyletter1) + ' ' + convertKeyword(keyletter2);
	}else{
        BG_POSITION = 'center';
    }
    if(numOfColors.includes("A")){
		numOfColors = numOfColors.replace("A", "");
		BG_SIZE = 'auto';
	}
    if(numOfColors.includes("M")){
        MODIFICATION_VERSIONS = Number(numOfColors.match(/M([0-9])*/)[1]);
        numOfColors = numOfColors.replace("M" + MODIFICATION_VERSIONS, "");
        if(document.getElementById('modify-mode').className === "hideSlider" || document.getElementById('modify-mode').className === "hiddenSliderInit"){
            document.getElementById('modify-mode').className = "showSlider";
        }
	}else{
		if(document.getElementById('modify-mode').className === "showSlider"){
		   document.getElementById('modify-mode').className = "hideSlider";
		}
	}
	if(numOfColors.includes("B")){
		var blend_num = numOfColors.match(/B[0-4]*/);
		numOfColors = numOfColors.replace(/B[0-4]*/, "");
		blend_num = String(blend_num).replace('B', '');
		if(blend_num === ''){
			blend_num = 0;
		}
		COLOR_MODE_NUMBER = Number(blend_num);
		document.getElementById('blendMode').innerHTML = ARR_COLOR_MODE[COLOR_MODE_NUMBER].toUpperCase() + " MODE";		
		if(document.getElementById('blend-mode').className === "hideSlider" || document.getElementById('blend-mode').className === "hiddenSliderInit"){
		   document.getElementById('blend-mode').className = "showSlider";
		}
	}else{
		if(document.getElementById('blend-mode').className === "showSlider"){
		   document.getElementById('blend-mode').className = "hideSlider";
		}
	}
    numOfColors = parseInt(numOfColors);
    if( isNaN(numOfColors) || numOfColors < 1 || numOfColors > 9 ){
        numOfColors = '1';
    }
    for(i = 1; i < 10; i++){
        document.getElementById('color-' + i).jscolor.fromString(COLOR[i]);        
        if(i <= numOfColors){
            document.getElementById('color-' + i).classList.remove('hiddenColor');
        }else{
            document.getElementById('color-' + i).classList.add('hiddenColor');
        }
    }
	document.getElementById("custom-color").className = 'colr' + numOfColors;
}

//function preservedAspectRatio(){
function calcBackgroundSize(){
    var temp = BG_ARRAY[1];
    if(temp.includes("preserveAspectRatio='none'")){               
        var w = temp.match(/width=\'([^']*)\'/)[1];
        var h = temp.match(/height=\'([^']*)\'/)[1];
        if(w.includes('%')){
            w = w.replace('%25', '%');
        }else{
            w = w + 'px';
        }
        if(h.includes('%')){
            h = h.replace('%25', '%');
        }else{
            h = h + 'px';
        }
        BG_SIZE = w + ' ' + h;
    }
}
function convertKeyword(keyletter){
    if(keyletter === 'b'){
        return 'bottom';
    }else if(keyletter === 't'){
        return 'top';
    }else if(keyletter === 'r'){
        return 'right';
    }else if(keyletter === 'l'){
        return 'left';
    }else if(keyletter === 'c'){
        return 'center';
    }
}

function convertScale(value){
	value = SCALE_MIN + (value * SCALE_MULTIPLE);
	return Math.round(value);	
}
function convertSize(value){	
	value = SIZE_MIN + (value * SIZE_MULTIPLE);
	return Math.round(value);
}

function setupRange(num, name, min, max, step, value){
	var divRange = document.getElementById('slider-' + num);
	var inputRange = divRange.getElementsByTagName("input")[0];
	divRange.className = "showSlider";
	divRange.getElementsByTagName("label")[0].innerHTML = name;
	inputRange.setAttribute('min', min);
	inputRange.setAttribute('max', max);
	inputRange.setAttribute('step', step);
	inputRange.setAttribute('value', value);
	inputRange.value = value;
}
function setupVariation(trueVar){
    if(trueVar){
        COLOR_VARIATION_NUMBER = 0;
        setVariationType();		
        if(document.getElementById('variation-mode').className === "hideSlider" || document.getElementById('variation-mode').className === "hiddenSliderInit"){
           document.getElementById('variation-mode').className = "showSlider";		   
        }
    }else{
        if(document.getElementById('variation-mode').className === "showSlider"){
           document.getElementById('variation-mode').className = "hideSlider";
        }
    }
}

function updateRange(id, value){ //this triggers twice in FF Chrome ... might want to gaurd against that... 
//https://stackoverflow.com/questions/18544890/onchange-event-on-input-type-range-is-not-triggering-in-firefox-while-dragging

	if(isNaN(id)){
       return;
    }
    if(isNaN(value)){
       return;
    }
	
	var rType = document.getElementById("slider-" + id).getElementsByTagName("label")[0].innerHTML;
	if(rType === "SIZE"){
		SIZE = value;
		updateSize(id);
	}else if (rType === "SCALE"){
		SCALE = value;
		updateScale();
	}else if (rType === "OPACITY"){
		OPACITY = value;
		updateOpacity();
	}else if (rType === "STROKE"){
        if(STROKE_WIDTH !== value){ //preventing double value?? Two listeners must be triggering
            STROKE_WIDTH = value;
            updateStrokeWidth();
        }		
	}else if (rType === "WIDTH"){
		updateWidth(id, value);
	}else if (rType === "HEIGHT"){
        updateHeight(id, value);
    }else if (rType === "POSITION"){
        //ARR_POSITION_VALUE[ARR_POSITION_ID[id]] = value;
        POSITION = value;
        updatePosition();
    }else if (rType === "MOVE"){
		updateMove();
	}else if (rType === "VARIANCE"){        
		VARIATION_STRENGTH = value;
        updateColor(1, COLOR[1]);
	}else if (rType === "ANGLE"){
		ANGLE = value;
		updateAngle(id);
	}else if (rType === "RADIAL"){
		RADIAL = value;
		updateRadial(id);
	}else if (rType === "SPIN"){
		PATTERN.spin = value;
		updatePattern();
	}else if (rType === "SPAN"){
		PATTERN.span = value;
		updatePattern();
	}else{
		o('bad rType: ' + rType);
	}
	applyBackground();
}

function updateColor(id, color){
    if(isNaN(id)){
       return;
    }    
    if(!/([0-9A-F]{6}$)/i.test(color)){
        return;
    }  
    color = String(color);
		COLOR[id] = color;  
		
    var temp = '';
	var oldColor = '';
	var newColor = '';
    var colorNumber;
    var color1;
    var color2;
    var colorPercent;
    var colorMode = ARR_COLOR_MODE[COLOR_MODE_NUMBER];
    if(NEW_VARIATION){                
        ARR_VARIATION = [];
    }
    for(var i = 0; i < PALETTE.length; i++){
        if(PALETTE[i].type === 'color'){
            PALETTE[i].color = COLOR[PALETTE[i].number];            
        }else if(PALETTE[i].type === 'steps'){
            colorNumber = PALETTE[i].number;
            color1 = Math.floor(colorNumber / 10);
            color2 = colorNumber - (color1 * 10);
            colorPercent = PALETTE[i].step / (STEP_COUNTER[colorNumber] + 1);
            PALETTE[i].color = String(chroma.mix(COLOR[color1], COLOR[color2], colorPercent, colorMode)).replace("#", '');
        }else if(PALETTE[i].type === 'blend'){
            colorNumber = PALETTE[i].number;
            color1 = Math.floor(colorNumber / 10);
            color2 = colorNumber - (color1 * 10);
            PALETTE[i].color = String(chroma.mix(COLOR[color1], COLOR[color2], 0.5, colorMode)).replace("#", '');               
        }
                
        if(PALETTE[i].type === 'copy'){
            PALETTE[i].color = COPIED_COLOR;
        }else{
            COPIED_COLOR = PALETTE[i].color;
        }
                
        if(PALETTE[i].vary === true){ //randomized fluctuating color from chosen color set
            var varied_color;
            var variation_set = COLOR_VARIATIONS[COLOR_VARIATION_NUMBER];
            var variation_strength;    
            if(NEW_VARIATION){                
                if(variation_set === 'random'){
                    varied_color = String(chroma.random()).replace("#", '');
                }else if(variation_set.length !== 2){
                    varied_color = variation_set[randomArrayElement(variation_set.length)];
                }else{
                    varied_color = String(chroma.mix( variation_set[0], variation_set[1], Math.ceil( Math.random() * 100)/100)).replace("#", '');
                }
                ARR_VARIATION[i] = [varied_color, Math.ceil( Math.random() * 100)/100];                
            }            
            varied_color = ARR_VARIATION[i][0];
            variation_strength = VARIATION_STRENGTH * ARR_VARIATION[i][1];              
            PALETTE[i].color = String(chroma.mix(PALETTE[i].color, varied_color, variation_strength)).replace("#", '');
        }
        
        if(PALETTE[i].lightness !== 0){ //moved after copy - darken/lighten doesn't need to be copied
            var fade_percent = 0;
            if(PALETTE[i].lightness > 1){ //fade
                fade_percent = PALETTE[i].lightness - 1;
                PALETTE[i].color = 'FFF';
                if(chroma.contrast(COLOR[PALETTE[i].number], '000') > 11){
                    PALETTE[i].color = PALETTE[i].color = '000';                
                }
                PALETTE[i].color = String(chroma.mix(COLOR[PALETTE[i].number], PALETTE[i].color, fade_percent)).replace("#", '');
            }else if(PALETTE[i].lightness < -1){ //boost
                fade_percent = PALETTE[i].lightness + 1;
                PALETTE[i].color = '000';
                if(chroma.contrast(COLOR[PALETTE[i].number], '000') > 11){
                    PALETTE[i].color = PALETTE[i].color = 'FFF';                
                }
                PALETTE[i].color = String(chroma.mix(COLOR[PALETTE[i].number], PALETTE[i].color, fade_percent)).replace("#", '');
            }else{
                PALETTE[i].color = applyLightness(PALETTE[i].color, PALETTE[i].lightness);
            }
        }
                
        temp = BG_ARRAY[PALETTE[i].line];
        oldColor = temp.match(/(\'\%23[^']*['])/)[1];
        newColor = "'%23" + PALETTE[i].color + "'";
        temp = temp.replace(oldColor,  newColor);
        BG_ARRAY[PALETTE[i].line] = temp;
    }
    NEW_VARIATION = false;
  	applyBackground();
}
    
function randomNumber(num){  // between 0 and num
  return Math.floor(Math.random() * (num + 1));
}
function randomArrayElement(num){  // between 0 and num
  return Math.floor(Math.random() * num);
}
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

    
function updateBlendMode(val){
    if(isNaN(val)){
       return;
    }
	COLOR_MODE_NUMBER = COLOR_MODE_NUMBER + val;
	if(COLOR_MODE_NUMBER > ARR_COLOR_MODE.length - 1){
		COLOR_MODE_NUMBER = 0;
	}else if(COLOR_MODE_NUMBER < 0){
		COLOR_MODE_NUMBER = ARR_COLOR_MODE.length - 1;
	}
	document.getElementById('blendMode').innerHTML = ARR_COLOR_MODE[COLOR_MODE_NUMBER].toUpperCase() + " MODE";
    
    updateColor(1, COLOR[1]);
}
function updateVaryMode(val){
    if(isNaN(val)){
       return;
    } 
    NEW_VARIATION = true;
	COLOR_VARIATION_NUMBER += val;    
	if(COLOR_VARIATION_NUMBER > COLOR_VARIATIONS.length - 1){
		COLOR_VARIATION_NUMBER = 0;
	}else if(COLOR_VARIATION_NUMBER < 0){
		COLOR_VARIATION_NUMBER = COLOR_VARIATIONS.length - 1;
	}    
    setVariationType(); 
    updateColor(1, COLOR[1]);
}
function setVariationType(){
    var mode = COLOR_VARIATION_NAME[COLOR_VARIATION_NUMBER];
    document.getElementById("varyMode").value = mode; 
}
function updateModMode(val){
    if(isNaN(val)){
       return;
    }    
    MODIFICATION_NUMBER += val;
    if(MODIFICATION_NUMBER < 1){
        MODIFICATION_NUMBER = MODIFICATION_VERSIONS;
    } else if (MODIFICATION_NUMBER > MODIFICATION_VERSIONS){
        MODIFICATION_NUMBER = 1;
    }
    var group_number = MODIFICATION_NUMBER;
    if(group_number === 1){
        group_number = '';
    }
    var bg_name = BG_NAME.toLowerCase();
    
    var el = document.getElementById(bg_name).getElementsByTagName("a")[0];
    el.className = 'button bg-' + bg_name + group_number; //change class name 
    selectBG('#' + bg_name, group_number);    
    el.className = 'button bg-' + bg_name; //change class name back;
}

function applyLightness(color, percent){
    if(percent === 0){
        return color;
    }else if (percent > 0){
        return String(chroma.mix(color, '#FFFFFF', percent)).replace("#", '');
    }else if (percent < 0){
        return String(chroma.mix(color, '#000', -percent)).replace("#", '');
    }
}

function updateStrokeWidth(){	
	var l = 0;
    var stroke_width;
    var stroke_multiple;
    //var temp;
	while(l < ARR_STROKE_WIDTH.length){        
		//temp = BG_ARRAY[ARR_STROKE_WIDTH[l]];        
        stroke_multiple = ARR_STROKE_MULTIPLE[ARR_STROKE_WIDTH[l]];
        if(stroke_multiple === undefined){
            stroke_multiple = 1;
        }        
        stroke_width = STROKE_WIDTH * stroke_multiple;
		//BG_ARRAY[ARR_STROKE_WIDTH[l]] = temp.replace(/stroke-width=\'[0-9.]*\'/, "stroke-width='" + stroke_width + "'");
        
        //console.log('class= ' + getAttrValue(line, attribute));
        updateAttrValue(ARR_STROKE_WIDTH[l], 'stroke-width', stroke_width);
        
        // /width=\'([^']*)\'/
        
        //var regEx = new RegExp(attribute + "=\\'([^']*)\\'");
        //var attr_value = BG_ARRAY[line].match(regEx)[1];
        
        
        //console.log( BG_ARRAY[ARR_STROKE_WIDTH[l]] + ' should equal...' );
        //console.log( temp.replace(/stroke-width=\'([^']*)\'/, "stroke-width='" + stroke_width + "'"));
		l++;
	}
}

function updatePattern(){
    var updatedValue = 'rotate(' + PATTERN.spin + ') scale(' + PATTERN.span + ')';
    var l = 0;
	while(l < PATTERN_LINES.length){
        updateAttrValue( PATTERN_LINES[l], 'patternTransform', updatedValue);
        l++;
    }
}

function updateAngle(num){ //0 - 360;	
	var center;
    var temp = BG_ARRAY[ARR_ANGLE[ARR_ANGLE_NUMBER[num]]];	
	if(ANGLE > 360){
		ANGLE = 360;
	}else if(ANGLE < 0){
		ANGLE = 0;
	}
    if(temp.includes("'100%25'")){
        center = "," + Math.floor(screenWidth()/2) + "," + Math.floor(screenHeight()/2);
    }else{
        center = "," + 0.5 + "," + 0.5;
    }
	var y2;
	if(temp.includes("gradientTransform")){
	}else{		
		y2 = temp.match(/y2=\'[0-9%]*\'/)[0];	
		temp = temp.replace(y2, y2 + " gradientTransform='rotate(0)'");
	}
	temp = temp.replace(/gradientTransform=\'rotate\([0-9,.]*\)\'/, "gradientTransform='rotate(" + ANGLE + center + ")'");
	BG_ARRAY[ARR_ANGLE[ARR_ANGLE_NUMBER[num]]] = temp;
}

function updateRadial(num){ //0 - 100;	
	var temp = BG_ARRAY[ARR_RADIAL[ARR_RADIAL_NUMBER[num]]];
	if(RADIAL > 100){
		RADIAL = 100;
	}else if(RADIAL < 0){
		RADIAL = 0;
	}
	temp = temp.replace(/ r=\'[0-9%.]*\'/, " r='" + RADIAL + "%25'");
	BG_ARRAY[ARR_RADIAL[ARR_RADIAL_NUMBER[num]]] = temp;
}

function updateScale(){    
	var value = convertScale(SCALE);
	var wValue = value;
	var hValue = value;
	var w = value;
	var h = value;
	var circle;
	var cx;
	var cy;
	var cr;
	var l = 0;
	while(l < ARR_SCALE.length){		
		var temp = BG_ARRAY[ARR_SCALE[l]];		
		if(temp.includes("width")){
			w = Number(temp.match(/width=\'([^']*)\'/)[1]);
			h = Number(temp.match(/height=\'([^']*)\'/)[1]);
		}else{
			cx = Number(temp.match(/cx=\'([^']*)\'/)[1]);
			cy = Number(temp.match(/cy=\'([^']*)\'/)[1]);
			cr = Number(temp.match(/ r=\'([^']*)\'/)[1]);
		}
        if(ORIGINAL_WIDTH === 0){
           ORIGINAL_WIDTH = w;
           ORIGINAL_HEIGHT = h;
        }
		if(w > h){ //decide whether w or h is bigger            
			hValue = Math.round(ORIGINAL_HEIGHT/ORIGINAL_WIDTH * value * 10)/10;            
			circle = wValue/2;
		}else{
			wValue = Math.round(ORIGINAL_WIDTH/ORIGINAL_HEIGHT * value * 10)/10;
			circle = hValue/2;
		}

		if(temp.includes("width")){
			temp = temp.replace("width='" + w + "'", "width='" + wValue + "'");
			temp = temp.replace("height='" + h + "'", "height='" + hValue + "'");
		}else{
			temp = temp.replace("cx='" + cx + "'", "cx='" + circle + "'");
			temp = temp.replace("cy='" + cy + "'", "cy='" + circle + "'");
			temp = temp.replace(" r='" + cr + "'", " r='" + circle + "'");
		}

		BG_ARRAY[ARR_SCALE[l]] = temp;
		l++;
	}
    
}

function updateSize(sizeID){    
	var value = convertSize(SIZE);
	var wValue = value;
	var hValue = value;
	var l = 0;
	
	while(l < ARR_SIZE.length){
		
		var temp = BG_ARRAY[ARR_SIZE[l]];
		if(temp.includes("width") && temp.includes("height")){
			var w = Number(temp.match(/width=[']([^']*)[']/)[1]);
			var h = Number(temp.match(/height=[']([^']*)[']/)[1]);
			if(w > h){ //decide whether w or h is bigger
				hValue = h/w * value;
			}else{
				wValue = w/h * value;
			}
			temp = temp.replace("width='" + w + "'", "width='" + wValue + "'");
			temp = temp.replace("height='" + h + "'", "height='" + hValue + "'");
		}
        if(temp.includes("viewBox")){
            var viewbox = temp.match(/viewBox=[']0 0 ([^']*)[']/)[1];
			temp = temp.replace("viewBox='0 0 " + viewbox + "'", "viewBox='0 0 " + wValue + ' ' + hValue + "'");            
        }
		if(temp.includes(" r='")){
			temp = temp.replace(/[ ]*r=\'[0-9.]*\'/, " r='" + value + "'");
		}		
		if(ARR_SIZE_NUMBER[l] === 'size' + ARR_SIZE_ID[sizeID]){
			BG_ARRAY[ARR_SIZE[l]] = temp;
		}
		l++;
	}
}

function updateWidth(id, value){
    var widths = [];
    var temp;
    var w;
    var wValue;
    var line = 0;
    var l = 0;
    while(l < WIDTH.length){   
        if(id === WIDTH[l].id){
            widths[widths.length] = l;
        }
        l++;
    }
    l = 0;
    while(l < widths.length){   
        WIDTH[widths[l]].value = value;
        line = WIDTH[widths[l]].line;
        temp = BG_ARRAY[line];
        
        //WIDTH[0].type;        
        //WIDTH[0].number; //number might not need to be recorded?
        w = temp.match(/width=[']([^']*)[']/)[1];
        wValue = value;   
        if(w.includes('%25')){
            wValue = value + '%25';
        }  
        temp = temp.replace("width='" + w + "'", "width='" + wValue + "'");        
        BG_ARRAY[line] = temp;
        if(line === 1){
            calcBackgroundSize();
        }
        l++;
    }
}

function updateHeight(id, value){
    var heights = [];
    var temp;
    var h;
    var hValue;
    var line = 0;
    var l = 0;    
    while(l < HEIGHT.length){   
        if(id === HEIGHT[l].id){
            heights[heights.length] = l;
        }        
        l++;
    }
    l = 0;
    while(l < heights.length){
        HEIGHT[heights[l]].value = value;
        line = HEIGHT[heights[l]].line;        
        temp = BG_ARRAY[line];        
        h = temp.match(/height=[']([^']*)[']/)[1];
        hValue = value;        
        if(h.includes('%25')){
            hValue = value + '%25';
        }        
        temp = temp.replace("height='" + h + "'", "height='" + hValue + "'");        
        BG_ARRAY[line] = temp;        
        if(line === 1){
            calcBackgroundSize();
        }
        l++;
    }    
}

function updatePosition(){
    //ARR_POSITION_ID[id];
    //console.log();
	var l = 0;
	while(l < ARR_POSITION.length){        
		var tempArr = ARR_POSITION[l]; //[l, pType, pValue]
        var temp = BG_ARRAY[tempArr[0]];
        var tempType = tempArr[1];
        var tempValue = tempArr[2];
        //var xValue = parseInt(tempValue.match(/[M]([0-9.-]*) [0-9.-]*/)[1]);
        //var yValue = parseInt(tempValue.match(/[M][0-9.-]* ([0-9.-]*)/)[1]);
        var xValue = Number(tempValue.match(/[M]([0-9.-]*) [0-9.-]*/)[1]);
        var yValue = Number(tempValue.match(/[M][0-9.-]* ([0-9.-]*)/)[1]);
        var newX = xValue;
        var newY = yValue;
        var position = parseInt(POSITION);
        //var position = parseInt(ARR_POSITION_VALUE[l]);
        var newValue;
        var replaceValue = temp.match(/[M][0-9.-]* [0-9.-]*/)[0];
        
        if(tempType.toUpperCase() !== tempType){ //lowercase x or y means negative number
            position = -position;
        }        
        if(tempType.toUpperCase() === 'X'){
            newX = xValue + position;
        }else if (tempType.toUpperCase() === 'Y'){
            newY = yValue + position;
        }
        if(tempType.includes('U')){
            newY = parseInt(yValue - position/2.5);
        }else if (tempType.includes('D')){
            newY = parseInt(yValue + position/2.5);
        }
        if(tempType.includes('R')){
            newX = xValue + position;
        }else if (tempType.includes('L')){
            newX = xValue - position;
        }        
        newValue = "M" + newX + " " + newY;
        temp = temp.replace(replaceValue, newValue);
		BG_ARRAY[tempArr[0]] = temp;
		l++;
	}   
}

function updateMove(){    
    var l = 0;
    var mVals = [];    
    var updatedValue, updatedSpace, line, value, orX, orY, rotate_origin;
    var mX, mY, mRotation, mScale;    
    
    while(l < ARR_MOVE.length){
        line = ARR_MOVE[l].line;
        if(mVals[line] === undefined){
           mVals[line] = [0, 0, 0, 1];
        }        
        value = document.getElementById("slider" + ARR_MOVE_RANGE[ARR_MOVE[l].id - 1]).value;
        
        mX = convertPercentage( 0, ARR_MOVE[l].x, parseInt(value));
        mY = convertPercentage( 0, ARR_MOVE[l].y, parseInt(value));
        mRotation = convertPercentage( 0, ARR_MOVE[l].rotate, parseInt(value));
        mScale = convertPercentage( 1, ARR_MOVE[l].scale, parseInt(value));
        
        mVals[line][0] += mX;
        mVals[line][1] += mY;
        mVals[line][2] += mRotation;
        mVals[line][3] *= mScale;
        
        updatedValue = '';
        updatedSpace = '';
        if( mVals[line][0] !== 0 ||  mVals[line][1] !== 0 ){
            updatedValue += 'translate(' + mVals[line][0] + ' ' + mVals[line][1] + ')';
            updatedSpace = ' ';
        }
        if( mVals[line][2] !== 0 ){
            rotate_origin = ARR_MOVE[l].origin;
            orX = rotate_origin[0];
            orY = rotate_origin[1];
            rotate_origin = ' ' + orX + ' ' + orY;
            updatedValue += updatedSpace + 'rotate(' + mVals[line][2] + rotate_origin + ')';
            updatedSpace = ' ';
        }
        if( mVals[line][3] !== 1 ){
            updatedValue += updatedSpace + 'scale(' + mVals[line][3] + ')';
        }        
        updateAttrValue(ARR_MOVE[l].line, 'transform', updatedValue);     
        l++;
    }
}
function convertPercentage(min, max, percentage){    
    if(min === 0 && max === 0){
        return 0;
    }
    var scale_difference = max - min;
    var scale_multiple = scale_difference/100;
    var value = min + (scale_multiple * percentage);
    //return Math.round(value);
    return Math.round(value * 100) / 100;
}

function updateOpacity(){ //need: avoid targeting stop-opacity    
	var l = 0;
    while(l < ARR_OPACITY.length){			
        var temp = BG_ARRAY[ARR_OPACITY[l]];		
        var oldOpacity = "opacity='" + temp.match(/opacity=\'([^']*)[']/)[1] + "'";
        var newOpacity = "opacity='" + OPACITY + "'";
        temp = temp.replace(oldOpacity,  newOpacity);
        BG_ARRAY[ARR_OPACITY[l]] = temp;
        l++;
    }
}

function applyBackground(){	
	BG_IMAGE = BG_ARRAY.join("");
	/* document.body.style.backgroundColor = "#" + COLOR[1];
	document.body.style.backgroundImage = BG_IMAGE;
	document.body.style.backgroundAttachment = BG_ATTACHMENT;
	document.body.style.backgroundSize = BG_SIZE;
    //document.body.style.backgroundRepeat = BG_NO_REPEAT;
    document.body.style.backgroundRepeat = BG_REPEAT;
    document.body.style.backgroundPosition = BG_POSITION; */
}

function o(code){
	if(TEST_VAR === 'X'){
	   TEST_VAR = "";
	}
	TEST_VAR += code + '\n\n'; //document.getElementById('codeOutput').innerHTML = code;
}

function getCode(){
	var bgOutput = 'background-color: #' + COLOR[1] + ';';
	if(BG_IMAGE.length > 1){
		optimizeOutput();
		bgOutput += '\nbackground-image: ' + BG_IMAGE + ';';        
	}
	if(BG_ATTACHMENT !== 'scroll'){
        bgOutput += '\nbackground-attachment: ' + BG_ATTACHMENT + ';';
	}
    /*if(BG_NO_REPEAT !== 'repeat'){
        bgOutput += '\nbackground-repeat: ' + BG_NO_REPEAT + ';';
    }*/
    if(BG_REPEAT !== 'repeat'){
        bgOutput += '\nbackground-repeat: ' + BG_REPEAT + ';';
    }
	if(BG_SIZE !== 'auto'){
        bgOutput += '\nbackground-size: ' + BG_SIZE + ';';
        //bgOutput += '\nbackground-position: center;';
	}
    if(BG_POSITION !== 'center'){ 
        bgOutput += '\nbackground-position: ' + BG_POSITION + ';'; 
    }
    
    return bgOutput;
}
var REMOVE_EXCESS_CODE = ["gradientTransform='rotate(0)'", "gradientTransform='rotate(360)'", "fill-opacity='1'", "stroke-opacity='1'", " opacity='1'"];
function optimizeOutput(){
	var l = 0;
	while(l < REMOVE_EXCESS_CODE.length){
		BG_IMAGE = BG_IMAGE.replace(REMOVE_EXCESS_CODE[l], '');
		l++;
	}
	BG_IMAGE = BG_IMAGE.replace(/  +/g, ' ');
}
function transformCode(){	//assistant
    //console.log('working');
	var inputer = document.getElementById('codeInputer'); 
	var outputer = document.getElementById('codeOutputer');
	outputer.innerHTML = encodeOptimizedSVGDataUri_assistant(inputer.value);
}

function titleCase(str){
	return str.toLowerCase().split(' ').map(function(word) {
	    return (word.charAt(0).toUpperCase() + word.slice(1));
	}).join(' ');
}
function encodeOptimizedSVGDataUri(svgString){ //https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
  var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
	.replace(/%0A/g, '') // remove newlines
	.replace(/%20/g, ' ') // put spaces back in
	.replace(/%3D/g, '=') // ditto equals signs
	.replace(/%3A/g, ':') // ditto colons
	.replace(/%2F/g, '/') // ditto slashes
	.replace(/%22/g, "'"); // replace quotes with apostrophes (may break certain SVGs)
  return 'data:image/svg+xml,' + uriPayload;
}

function encodeOptimizedSVGDataUri_assistant(svgString){ //https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
    if(svgString.length > 20){        
    
        svgString = svgString.replace(/\r?\n|\r/g, '');
        svgString = svgString.replace(/ +(?= )/g, '');
        var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
        .replace(/%0A/g, '') // remove newlines
        .replace(/%20/g, ' ') // put spaces back in
        .replace(/%3D/g, '=') // ditto equals signs
        .replace(/%3A/g, ':') // ditto colons
        .replace(/%2F/g, '/') // ditto slashes
        .replace(/%2C/g, ' ') // replace commas with spaces
        // add this: replace spaces and tabs between attribute width='21 '
        .replace(/%22/g, "'"); // replace quotes with apostrophes (may break certain SVGs)
        
        uriPayload = uriPayload.replace(/\%3E \%3C/g,'%3E%3C');
        uriPayload = uriPayload.replace(/\%09/g,'');    
        var viewBOX = uriPayload.match(/viewBox=\'[0-9 %.]*\'/)[0];
        var svgTAG = uriPayload.match(/%3Csvg(.*)xml\:space=\'preserve\'%3E/)[0];    
        uriPayload = uriPayload.replace(svgTAG,'');
        
        var svgDATA = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' ';
        if(uriPayload.includes('use xlink:href')){
            svgDATA += "xmlns:xlink='http://www.w3.org/1999/xlink' ";
        }
        
        if(false){ //eventually make radio box for scaling
            var viewBoxNumbers = viewBOX.replace("viewBox='",'');
            viewBoxNumbers = viewBoxNumbers.replace("'",'');
            viewBoxNumbers = viewBoxNumbers.split(' ');
            var dataWidth = viewBoxNumbers[2] - viewBoxNumbers[0];
            var dataHeight = viewBoxNumbers[3] - viewBoxNumbers[1];            
            svgDATA +=  "class='scale' width='"  + dataWidth +  "' height='"  + dataHeight +  "' ";
        }
        
        return  svgDATA + viewBOX + '%3E' + uriPayload;
    }
}

var FILE_CONTENT = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'/><path fill='#600' points='M1462 250L512 900L0 900L0 0L1267 0'/><path fill='#700' points='M1462 250L150 900L0 900L0 0L296 0'/><path fill='#800' points='M1462 250L1410 900L150 900'/></svg>";

function svgDownload(){
    var extraBackground = "><";
    if(ORIGINAL_WIDTH > 0){
        extraBackground = "><rect fill='#" + COLOR[1] + "' width='" + ORIGINAL_WIDTH + "' height='" + ORIGINAL_HEIGHT + "'/><";
    }    
    FILE_CONTENT = BG_IMAGE
    .replace('url("data:image/svg+xml,', '')
    .replace('")', '')
    .replace(/%3C/g, '<')
    .replace(/%3E/g, '>')
    .replace(/%25/g, '%')
    .replace(/%23/g, '#')
    .replace(/%2C/g, ',')
    .replace('><', extraBackground);
    var blob = new Blob([FILE_CONTENT], {type: "image/svg+xml;charset=utf-8"});
    saveAs(blob, BG_NAME+".svg");
}

