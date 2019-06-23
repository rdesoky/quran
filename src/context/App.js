import React, { Component } from "react";
import { withRouter } from "react-router-dom";

const AppState = {
	isNarrow: false,
	pagesCount: 1,
	appWidth: 800,
	appHeight: 600,
	pagesCount: 2,
	showMenu: false,
	popup: null
};

const AppContext = React.createContext(AppState);

class AppProvider extends Component {
	state = AppState;

	setIsNarrow(isNarrow) {
		this.setState({ isNarrow: isNarrow });
	}

	setShowMenu(showMenu) {
		this.setState({ showMenu });
	}

	toggleShowMenu() {
		this.setState({ showMenu: !this.state.showMenu });
	}

	setPopup(popup) {
		this.setState({ popup });
	}

	nextPage() {
		this.offsetPage(1);
	}

	prevPage() {
		this.offsetPage(-1);
	}

	pageWidth() {
		let width = (this.state.appHeight - 50) * 0.61;
		if (width > this.state.appWidth) {
			return this.state.appWidth;
		}
		return width;
	}

	offsetPage(shift) {
		const { location, history } = this.props;
		let match = location.pathname.match(/page\/(.+)/);
		let pageNumber = match ? match[1] : undefined;
		if (pageNumber !== undefined) {
			let nextPage = parseInt(pageNumber) + shift;
			if (nextPage <= 604 && nextPage >= 1) {
				history.replace("/page/" + nextPage.toString());
			}
		}
	}

	methods = {
		setShowMenu: this.setShowMenu.bind(this),
		toggleShowMenu: this.toggleShowMenu.bind(this),
		setPopup: this.setPopup.bind(this),
		nextPage: this.nextPage.bind(this),
		prevPage: this.prevPage.bind(this),
		offsetPage: this.offsetPage.bind(this),
		pageWidth: this.pageWidth.bind(this)
	};

	onResize = e => {
		let { innerWidth, innerHeight } = e.target;
		let newSize = { width: innerWidth, height: innerHeight };
		this.updateAppSizes(newSize);
	};

	updateAppSizes({ width, height }) {
		this.setState({ appWidth: width, appHeight: height });
		let count = this.calcPagesCount({ width, height });
		this.setState({ pagesCount: count });
		let isNarrow = width / height < 0.7;
		this.setState({ isNarrow: isNarrow });
	}

	calcPagesCount({ width, height }) {
		return width > height * 1.35 ? 2 : 1;
	}

	componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.updateAppSizes({
			width: window.innerWidth,
			height: window.innerHeight
		});
	}

	render() {
		return (
			<AppContext.Provider
				value={{
					...this.props,
					...this.state,
					...this.methods
				}}
			>
				{this.props.children}
			</AppContext.Provider>
		);
	}
}

const withAppContext = Component =>
	function AppContextWrapper(props) {
		return (
			<AppContext.Consumer>
				{state => <Component {...props} appContext={state} />}
			</AppContext.Consumer>
		);
	};

export default withRouter(AppProvider);
export { withAppContext, AppContext };
