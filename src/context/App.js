import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import QData from "../services/QData";

const AppState = {
	isNarrow: false,
	pagesCount: 1,
	appWidth: 800,
	appHeight: 600,
	pagesCount: 2,
	showMenu: false,
	popup: null,
	selectStart: 0,
	selectEnd: 0,
	maskStart: -1
};

const AppContext = React.createContext(AppState);

class AppProvider extends Component {
	state = AppState;

	setTheme = theme => {
		this.setState({ theme });
		localStorage.setItem("theme", theme);
	};

	selectAya = ayaId => {
		if (ayaId >= 0 && ayaId < QData.ayatCount()) {
			this.setState({ selectStart: ayaId, selectEnd: ayaId });
		}
	};

	extendSelection = ayaId => {
		if (ayaId < 0 || ayaId >= QData.ayatCount()) {
			return this.state.selectStart;
		}
		if (ayaId === this.state.selectEnd) {
			this.selectAya(ayaId);
		} else {
			this.setState({ selectStart: ayaId });
		}
		return this.state.selectStart;
	};

	offsetSelection = offset => {
		this.selectAya(this.state.selectStart + offset);
		return this.state.selectStart;
	};

	setSelectStart = selectStart => {
		this.setState({ selectStart });
	};

	setMaskStart = maskStart => {
		this.setState({ maskStart, selectStart: maskStart, selectEnd: maskStart });
	};

	hideMask = () => {
		this.setState({ maskStart: -1 });
	};

	setSelectEnd = selectEnd => {
		this.setState({ selectEnd });
	};

	offsetMask = offset => {
		let ms = parseInt(this.state.maskStart);
		if (ms !== -1) {
			let maskStart = ms + offset;
			if (maskStart >= 0 && maskStart < QData.ayatCount()) {
				this.setMaskStart(maskStart);
			}
		}
	};

	setIsNarrow = isNarrow => {
		this.setState({ isNarrow: isNarrow });
	};

	setShowMenu = showMenu => {
		this.setState({ showMenu });
	};

	toggleShowMenu = () => {
		this.setState({ showMenu: !this.state.showMenu });
	};

	setPopup = popup => {
		this.setState({ popup });
	};

	nextPage = () => {
		this.offsetPage(1);
	};

	prevPage = () => {
		this.offsetPage(-1);
	};

	pageWidth = () => {
		let width = this.pageHeight() * 0.61; //aspect ratio
		if (width > this.state.appWidth) {
			return this.state.appWidth;
		}
		return width;
	};

	pageHeight = () => {
		return this.state.appHeight - 50;
	};

	pageMargin = () => {
		return this.state.isNarrow ? "0" : "0 20px";
	};

	offsetPage = shift => {
		const { location } = this.props;
		let match = location.pathname.match(/page\/(.+)/);
		let pageNumber = match ? match[1] : undefined;
		if (pageNumber !== undefined) {
			let nextPage = parseInt(pageNumber) + shift;
			this.gotoPage(nextPage, true);
		}
	};

	gotoPage = (page, replace) => {
		const { history } = this.props;
		if (page <= 604 && page >= 1) {
			let targetPath = "/page/" + page.toString();
			if (replace) {
				history.replace(targetPath);
			} else {
				history.push(targetPath);
			}
		}
	};

	gotoSura = index => {
		const page = QData.sura_info[index].sp;
		this.gotoPage(page);
	};

	gotoPart = index => {
		const page = QData.parts[index].p;
		this.gotoPage(page);
	};

	methods = {
		setShowMenu: this.setShowMenu,
		toggleShowMenu: this.toggleShowMenu,
		setPopup: this.setPopup,
		nextPage: this.nextPage,
		prevPage: this.prevPage,
		offsetPage: this.offsetPage,
		gotoPage: this.gotoPage,
		gotoSura: this.gotoSura,
		gotoPart: this.gotoPart,
		pageWidth: this.pageWidth,
		pageHeight: this.pageHeight,
		setSelectStart: this.setSelectStart,
		setSelectEnd: this.setSelectEnd,
		setMaskStart: this.setMaskStart,
		hideMask: this.hideMask,
		offsetMask: this.offsetMask,
		pageMargin: this.pageMargin,
		setTheme: this.setTheme,
		setSelectStart: this.setSelectStart,
		setSelectEnd: this.setSelectEnd,
		offsetSelection: this.offsetSelection,
		selectAya: this.selectAya,
		extendSelection: this.extendSelection
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
