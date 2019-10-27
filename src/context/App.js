import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import QData from "../services/QData";
import Utils from "./../services/utils";
import firebase from "firebase";
import { injectIntl } from "react-intl";

let rc = localStorage.getItem("recentCommands");

const AppState = {
    user: null,
    modalPopup: false,
    hifzRanges: [],
    bookmarks: [],
    isNarrow: false, //hidden sidebar and streched single page width
    isCompact: false, //single page with extra margin for popup
    isWide: false, //two pages with extra margin for popup
    isScrollable: false, // too wide
    pagesCount: 2,
    appWidth: 800,
    appHeight: 600,
    displayMode: 0, //0:compact, 1:single page, 15:single page+margin, 2:two pages, 25: two pages+margin
    showMenu: false,
    popup: null,
    showPopup: false,
    selectStart: 0,
    selectEnd: 0,
    maskStart: -1,
    recentCommands: rc
        ? JSON.parse(rc)
        : [
              "Search",
              "Index",
              "Exercise",
              "Tafseer",
              "Favorites",
              "Mask",
              "Theme",
              "Bookmarks",
              "Copy",
              "Goto"
          ]
};

const AppContext = React.createContext(AppState);

class AppProvider extends Component {
    state = AppState;

    _verseList = [];
    _normVerseList = [];
    _suraNames = undefined;

    setTheme = theme => {
        this.setState({ theme });
        localStorage.setItem("theme", theme);
    };

    selectAya = ayaId => {
        if (ayaId === undefined) {
            ayaId = this.state.selectStart;
            this.hideMask();
        }
        if (ayaId >= 0 && ayaId < QData.ayatCount()) {
            this.setState({ selectStart: ayaId, selectEnd: ayaId });
            return ayaId;
        }
    };

    get formatMessage() {
        return this.props.intl.formatMessage;
    }

    suraNames = () => {
        if (!this._suraNames) {
            this._suraNames = this.formatMessage({ id: "sura_names" }).split(
                ","
            );
        }
        return this._suraNames;
    };

    verseList = () => {
        return this._verseList;
    };

    normVerseList = () => {
        return this._normVerseList;
    };

    pushRecentCommand = command => {
        if (
            [
                "Commands",
                "Play",
                "AudioPlayer",
                "Settings",
                "Profile",
                "ToggleButton",
                "Pause",
                "Stop"
            ].includes(command)
        ) {
            return;
        }
        let recentCommands = [
            command,
            ...this.state.recentCommands.filter(c => c !== command)
        ];
        recentCommands.length = 12;
        setTimeout(() => this.setState({ recentCommands }), 1);
        localStorage.setItem("recentCommands", JSON.stringify(recentCommands));
    };

    extendSelection = ayaId => {
        if (ayaId < 0 || ayaId >= QData.ayatCount()) {
            return this.state.selectStart;
        }
        if (ayaId === this.state.selectStart) {
            this.selectAya(ayaId);
        } else {
            this.setState({ selectStart: ayaId });
        }
        return this.state.selectStart;
    };

    offsetSelection = offset => {
        let newSelectionId = this.selectAya(this.state.selectStart + offset);
        return newSelectionId !== undefined
            ? newSelectionId
            : this.state.selectStart;
    };

    setSelectStart = selectStart => {
        this.setState({ selectStart });
    };

    setMaskStart = (maskStart, keepSelection = false) => {
        if (maskStart === undefined) {
            let { selectStart, selectEnd } = this.state;
            if (this.state.maskStart !== -1) {
                this.hideMask();
                return;
            }

            maskStart = selectStart < selectEnd ? selectStart : selectEnd;
        }
        if (keepSelection) {
            this.setState({ maskStart });
        } else {
            this.setState({
                maskStart,
                selectStart: maskStart,
                selectEnd: maskStart
            });
        }
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

    // setIsNarrow = isNarrow => {
    //     this.setState({ isNarrow: isNarrow });
    // };

    setShowMenu = showMenu => {
        this.setState({ showMenu });
        if (showMenu) {
            this.setState({ showPopup: false });
        }
    };

    toggleShowMenu = () => {
        this.setShowMenu(!this.state.showMenu);
    };

    setPopup = popup => {
        if (this.state.popup) {
            const newPopup = this.state.popup == popup ? null : popup;
            this.closePopup(newPopup);
        } else {
            this.setState({ popup, showMenu: null, showPopup: true });
        }
        if (popup !== null && popup !== "Commands") {
            this.pushRecentCommand(popup);
        }
    };

    closePopup = (newPopup = null) => {
        this.setState({ showPopup: false });
        setTimeout(() => {
            this.setState({ popup: newPopup, showPopup: newPopup !== null });
            Utils.selectTopCommand();
        }, 500);
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

    getCurrentPageNumber = () => {
        const { location } = this.props;
        let match = location.pathname.match(/page\/(.+)/);
        let pageNumber = match ? match[1] : undefined;
        return pageNumber;
    };

    getCurrentPageIndex = () => {
        let pageNumber = this.getCurrentPageNumber();
        return pageNumber !== undefined ? parseInt(pageNumber) - 1 : 0;
    };

    offsetPage = shift => {
        let pageNumber = this.getCurrentPageNumber();
        if (pageNumber !== undefined) {
            let nextPage = parseInt(pageNumber) + shift;
            this.gotoPage(nextPage, true);
        }
    };

    /**
     * Change app state to page number
     */
    gotoPage = (pageNum, replace) => {
        const { history } = this.props;
        if (pageNum <= 604 && pageNum >= 1) {
            let targetPath =
                `${process.env.PUBLIC_URL}/page/` + pageNum.toString();
            if (replace) {
                history.replace(targetPath);
            } else {
                history.push(targetPath);
            }
        }
    };

    /**
     * Navigate to sura Index
     */
    gotoSura = index => {
        const page = QData.sura_info[index].sp;
        this.gotoPage(page);
        const ayaId = QData.ayaID(parseInt(index), 0);
        this.selectAya(ayaId);
    };

    gotoPart = index => {
        const partInfo = QData.parts[index];
        const page = partInfo.p;
        this.gotoPage(page);
        const ayaId = QData.ayaID(partInfo.s - 1, partInfo.a - 1);
        this.selectAya(ayaId);
    };

    gotoAya = (ayaId, opt = { sel: false, replace: true }) => {
        if (opt.sel) {
            this.selectAya(ayaId);
            this.hideMask();
        }
        const pageIndex = QData.ayaIdPage(ayaId);
        this.gotoPage(pageIndex + 1, opt.replace);
    };

    getActiveSide = () => {
        let activePage = this.getCurrentPageIndex();
        let side = this.state.pagesCount === 1 ? 0 : activePage % 2;
        return side;
    };

    getSelectedText = () => {
        let { selectStart, selectEnd } = this.state;
        if (selectStart > selectEnd) {
            [selectStart, selectEnd] = [selectEnd, selectStart];
        }
        const verses = this.verseList()
            .slice(selectStart, selectEnd + 1)
            .map((t, i) => {
                const { sura, aya } = QData.ayaIdInfo(selectStart + i);
                return `${t} (${sura + 1}:${aya + 1})`;
            });

        return verses.join(" ");
    };

    pagerWidth = () => {
        const {
            popup,
            isWide,
            appWidth,
            appHeight,
            isCompact,
            isNarrow,
            isScrollable
        } = this.state;

        if (popup) {
            if (isScrollable) {
                return appWidth - appWidth / 3;
            }
            if (isWide) {
                return appHeight * 1.25;
            }
            if (isCompact) {
                return appHeight * 0.65;
            }
        }

        return appWidth - (isNarrow ? 0 : 50);
    };

    sideBarWidth = () => {
        return this.state.isNarrow ? 0 : 50;
    };

    popupWidth = () => {
        const {
            isWide,
            appWidth,
            appHeight,
            pagesCount,
            isCompact,
            isScrollable
        } = this.state;

        if (isScrollable) {
            return appWidth / 3;
        }

        if (isWide) {
            //popup fills up the margin of two pages view
            return appWidth - appHeight * 1.25;
        }
        if (isCompact) {
            //popup fills up the margin of one page view
            return appWidth - appHeight * 0.65;
        }

        //popup shown on top of pages
        return appWidth / pagesCount;
    };

    selectedRange = () => {
        const { selectStart, selectEnd } = this.state;
        return {
            start: Math.min(selectStart, selectEnd),
            end: Math.max(selectStart, selectEnd)
        };
    };

    addBookmark = () => {
        if (!this.bookmarksRef) {
            return;
        }
        const verse = this.selectedRange().start;
        this.bookmarksRef.child(verse).set(-new Date().getTime());
    };

    removeBookmark = verse => {
        if (!this.bookmarksRef) {
            return;
        }
        this.bookmarksRef.child(verse).set(null);
    };

    setModalPopup = (modalPopup = true) => {
        this.setState({ modalPopup });
    };

    methods = {
        suraNames: this.suraNames,
        selectedRange: this.selectedRange,
        popupWidth: this.popupWidth,
        setShowMenu: this.setShowMenu,
        toggleShowMenu: this.toggleShowMenu,
        setPopup: this.setPopup,
        nextPage: this.nextPage,
        prevPage: this.prevPage,
        offsetPage: this.offsetPage,
        gotoAya: this.gotoAya,
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
        offsetSelection: this.offsetSelection,
        selectAya: this.selectAya,
        extendSelection: this.extendSelection,
        pushRecentCommand: this.pushRecentCommand,
        verseList: this.verseList,
        normVerseList: this.normVerseList,
        closePopup: this.closePopup,
        getActiveSide: this.getActiveSide,
        getCurrentPageIndex: this.getCurrentPageIndex,
        getSelectedText: this.getSelectedText,
        pagerWidth: this.pagerWidth,
        sideBarWidth: this.sideBarWidth,
        addBookmark: this.addBookmark,
        removeBookmark: this.removeBookmark,
        setModalPopup: this.setModalPopup
    };

    onResize = e => {
        const { innerWidth, innerHeight } = e.target;
        const newSize = { width: innerWidth, height: innerHeight };
        this.updateAppSizes(newSize);
    };

    updateAppSizes({ width, height }) {
        this.setState({ appWidth: width, appHeight: height });
        const pagesCount = this.calcPagesCount({ width, height });
        const isNarrow = width / height < 0.7;
        const isWide = width / height > 1.8;
        const isCompact = !isWide && pagesCount == 1 && width / height > 1.2;
        const isScrollable = width / height > 2.7;
        this.setState({
            pagesCount,
            isNarrow,
            isWide,
            isCompact,
            isScrollable
        });
    }

    calcPagesCount({ width, height }) {
        return width > height * 1.35 ? 2 : 1;
    }

    componentWillUnmount() {
        this.unregisterAuthObserver();
        this.onBookmarkUpdate();
    }

    dbRef = null;
    hifzRef = null;
    bookmarksRef = null;
    onBookmarkUpdate = null;
    onHifzUpdate = null;

    readFireData() {
        //unregister previous listener if exists
        if (this.bookmarksRef && this.onBookmarkUpdate) {
            this.bookmarksRef.off("value", this.onBookmarkUpdate);
        }
        if (this.hifzRef && this.onHifzUpdate) {
            this.hifzRef.off("value", this.onHifzUpdate);
        }

        //Create new references
        this.hifzRef = this.dbRef.child(`data/${this.state.user.uid}/hifz`);
        this.bookmarksRef = this.dbRef.child(
            `data/${this.state.user.uid}/aya_marks`
        );

        //create new "value" listeners
        this.onBookmarkUpdate = this.bookmarksRef.on("value", snapshot => {
            if (snapshot == null) {
                return;
            }
            const snapshot_val = snapshot.val();
            const bookmarks = !snapshot_val
                ? []
                : Object.keys(snapshot_val)
                      .sort((k1, k2) =>
                          snapshot_val[k1] < snapshot_val[k2] ? -1 : 1
                      )
                      .map(k => ({ aya: k, ts: snapshot_val[k] }));
            this.setState({ bookmarks });
        });

        this.onHifzUpdate = this.hifzRef.on("value", snapshot => {
            const snapshot_val = snapshot.val();
            const hifzRanges = snapshot_val
                ? Object.keys(snapshot_val)
                      .sort((k1, k2) =>
                          snapshot_val[k1].ts < snapshot_val[k2].ts ? -1 : 1
                      )
                      .map(k => {
                          const sura = parseInt(k.substr(3, 3));
                          const startPage = parseInt(k.substr(0, 3));
                          const hifzInfo = snapshot_val[k];
                          const pages = hifzInfo.pages;
                          const endPage = startPage + pages - 1;
                          return {
                              sura,
                              startPage,
                              pages,
                              endPage,
                              date: hifzInfo.ts
                          };
                      })
                : [];
            this.setState({ hifzRanges });
        });
    }

    componentDidMount() {
        this.unregisterAuthObserver = firebase
            .auth()
            .onAuthStateChanged(user => {
                this.setState({ user });
                if (user == null) {
                    //sign in anonymously
                    firebase.auth().signInAnonymously();
                } else {
                    this.readFireData();
                    console.log(`Logged in userId ${JSON.stringify(user)}`);
                }
            });

        this.dbRef = firebase.database().ref();

        const ayaId = QData.pageAyaId(this.getCurrentPageIndex());
        this.selectAya(ayaId);
        window.addEventListener("resize", this.onResize);
        this.updateAppSizes({
            width: window.innerWidth,
            height: window.innerHeight
        });

        fetch(`${process.env.PUBLIC_URL}/quran.txt`)
            .then(results => results.text())
            .then(text => {
                this._verseList = text.split("\n");
            })
            .catch(e => {});

        fetch(`${process.env.PUBLIC_URL}/normalized_quran.txt`)
            .then(results => results.text())
            .then(text => {
                this._normVerseList = text.split("\n");
            })
            .catch(e => {});
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

//Create the context consumer generator function
const AppConsumer = Component =>
    function AppConsumerGen(props) {
        return (
            <AppContext.Consumer>
                {state => <Component {...props} app={state} />}
            </AppContext.Consumer>
        );
    };

export default injectIntl(withRouter(AppProvider));
export { AppConsumer };
