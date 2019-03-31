import FontManager from "font-picker/dist/font-manager/font-manager/FontManager";
import "font-picker/dist/styles.min.css";
import "./FontPicker.scss";
import React, { PureComponent } from "react";
import { DYNAMIC_STYLING } from "../campaigns/Campaign";

/*
	Credit:
	https://github.com/samuelmeuli/font-picker-react
*/

/**
 * Return the fontId based on the provided font family
 */
function getFontId(fontFamily) {
	return fontFamily.replace(/\s+/g, "-").toLowerCase();
}

export default class FontPicker extends PureComponent {
	constructor(props) {
		super(props);

		const {
			apiKey,
			activeFontFamily,
			pickerId,
			families,
			categories,
			scripts,
			variants,
			limit,
			onChange,
		} = this.props;

		this.state = {
			activeFontFamily,
			expanded: false,
			loadingStatus: "loading",
		};

		const options = {
			pickerId,
			families,
			categories,
			scripts,
			variants,
			limit,
		};

		// Initialize FontManager object and generate font list
		this.fontManager = new FontManager('AIzaSyAkP3rFhppIpRvnpmMs6fm008okV2muvhE', activeFontFamily, options, onChange);
		this.fontManager
			.init()
			.then(() => {
				this.setState({
					loadingStatus: "finished",
				});
			})
			.catch((err) => {
				// On error: Log error message
				this.setState({
					loadingStatus: "error",
				});
				console.error("Error trying to fetch the list of available fonts");
				console.error(err);
			});

		// Function bindings
		this.onClose = this.onClose.bind(this);
		this.onSelection = this.onSelection.bind(this);
		this.setActiveFontFamily = this.setActiveFontFamily.bind(this);
		this.toggleExpanded = this.toggleExpanded.bind(this);
	}

	/**
	 * After every component update, check whether the activeFontFamily prop has changed. If so,
	 * call this.setActiveFontFamily with the new font
	 */
	componentDidUpdate() {
		const { activeFontFamily: fontFamilyProps } = this.props;
		const { activeFontFamily: fontFamilyState } = this.state;

		console.log("+ Props family: " + this.props.activeFontFamily);
		console.log("+ State family: " + this.state.activeFontFamily);

		if (this.props.activeFontFamily !== this.state.activeFontFamily) {
			this.setActiveFontFamily(this.props.activeFontFamily);
			console.log(this.state);
		}
	}

	/**
	 * EventListener for closing the font picker when clicking anywhere outside it
	 */
	onClose(e) {
		let targetElement = e.target; // Clicked element

		do {
			if (
				targetElement === document.getElementById(`font-picker${this.fontManager.selectorSuffix}`)
			) {
				// Click inside font picker
				return;
			}
			// Move up the DOM
			targetElement = targetElement.parentNode;
		} while (targetElement);

		// Click outside font picker
		this.toggleExpanded();
	}

	/**
	 * Update the active font on font button click
	 */
	onSelection(e) {
		const target = e.target;
		const activeFontFamily = target.textContent;
		this.setActiveFontFamily(activeFontFamily);
		this.toggleExpanded();
	}

	/**
	 * Set the specified font as the active font in the fontManager, update activeFontFamily in the
	 * state and call the onChange prop function
	 */
	setActiveFontFamily(activeFontFamily) {
		const { onChange } = this.props;

		/* this.fontManager.addFont(activeFontFamily, "");
		this.fontManager.setActiveFont(activeFontFamily);
		this.setState({
			activeFontFamily,
		});
		onChange(this.fontManager.getActiveFont()); */

		console.log(`**** ${activeFontFamily}`);
		console.log(DYNAMIC_STYLING);

		this.state.activeFontFamily = activeFontFamily;

		this.setState({
			activeFontFamily,
		});

		onChange(activeFontFamily);
	}

	/**
	 * Generate <ul> with all font families
	 */
	generateFontList(fonts) {
		const { activeFontFamily, loadingStatus } = this.state;

		if (loadingStatus !== "finished") {
			return <div />;
		}
		return (
			<ul>
				{fonts.map(font => {
					const isActive = font.family === activeFontFamily;
					const fontId = getFontId(font.family);
					return (
						<li key={fontId}>
							<div
								type="button"
								id={`font-button-${fontId}${this.fontManager.selectorSuffix}`}
								className={isActive ? "active-font" : ""}
								onClick={this.onSelection}
								onKeyPress={this.onSelection}
								style={{padding: "5px 20px"}}
							>
								{font.family}
							</div>
						</li>
					);
				})}
			</ul>
		);
	}

	/**
	 * Expand/collapse the picker's font list
	 */
	toggleExpanded() {
		const { expanded } = this.state;

		if (expanded) {
			this.setState({
				expanded: false,
			});
			document.removeEventListener("click", this.onClose);
		} else {
			this.setState({
				expanded: true,
			});
			document.addEventListener("click", this.onClose);
		}
	}

	render() {
		console.log("RERERENDER");
		const { sort } = this.props;
		const { activeFontFamily, expanded, loadingStatus } = this.state;

		// Extract and sort font list
		const fonts = Array.from(this.fontManager.getFonts().values());
		if (sort === "alphabet") {
			fonts.sort((font1, font2) => font1.family.localeCompare(font2.family));
		}

		console.log(this.state);

		// Render font picker button and attach font list to it
		return (
			<div
				id={`font-picker${this.fontManager.selectorSuffix}`}
				className={expanded ? "expanded" : ""}
				style={{position: "relative"}}
			>
				<span
					type="button"
					className="dropdown-button"
					onClick={this.toggleExpanded}
					onKeyPress={this.toggleExpanded}
				>
					<p className="dropdown-font-family"><strong>Font:</strong> {activeFontFamily}</p>
					<p className={`dropdown-icon ${loadingStatus}`} />
				</span>
				{loadingStatus === "finished" && this.state.expanded && this.generateFontList(fonts)}
			</div>
		);
	}
}

FontPicker.defaultProps = {
	defaultFamily: "Open Sans",
	pickerId: "",
	families: [],
	categories: [],
	scripts: ["latin"],
	variants: ["regular"],
	limit: 50,
	sort: "alphabet",
	onChange: () => {},
};

