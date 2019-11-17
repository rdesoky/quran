import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import QData from "../services/QData";
import Utils from "./../services/utils";
import firebase from "firebase";
import { injectIntl } from "react-intl";

let rc = localStorage.getItem("commands");

const AppState = {
    user: null,
    expandedMenu: false,
    modalPopup: false,
    hifzRanges: [],
    bookmarks: [],
    daily: {
        pages: [], //{date:'??',pages:123}
        chars: [] //{date:'??',chars:123}
    },
    isNarrow: false, //hidden sidebar and streched single page width
    isCompact: false, //single page with extra margin for popup
    isWide: false, //two pages with extra margin for popup
    isScrollable: false, // too wide
    pagesCount: 1,
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
              "Index",
              "AudioPlayer",
              "Search",
              "Exercise",
              "Tafseer",
              "Mask",
              "Goto",
              "Theme",
              "Bookmarks",
              "Copy",
              "Share",
              "Favorites",
              //   "Profile",
              "Settings",
              "Help"
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

    suraName = index => {
        return index < 114 ? this.suraNames()[index] : "";
    };

    verseText = verse => {
        return verse < QData.ayatCount() ? this.verseList()[verse] : "";
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
                // "AudioPlayer",
                // "Settings",
                "Profile",
                // "ToggleButton",
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
        // recentCommands.length = 12;
        setTimeout(() => this.setState({ recentCommands }), 1);
        localStorage.setItem("commands", JSON.stringify(recentCommands));
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
        return ayaId;
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
        if (this.state.popup === "Exercise") {
            this.offsetSelection(offset);
            return;
        }
        let ms = parseInt(this.state.maskStart);
        if (ms !== -1) {
            let maskStart = ms + offset;
            if (maskStart >= 0 && maskStart < QData.ayatCount()) {
                this.setMaskStart(maskStart);
            }
        }
    };

    setShowMenu = showMenu => {
        this.setState({ showMenu });
        // if (showMenu) {
        //     this.setState({ showPopup: false });
        // }
        // if (!showMenu) {
        //     this.setState({ expandedMenu: false });
        // }
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
        return ayaId;
    };

    gotoPart = index => {
        const partInfo = QData.parts[index];
        const page = partInfo.p;
        this.gotoPage(page);
        const ayaId = QData.ayaID(partInfo.s - 1, partInfo.a - 1);
        this.selectAya(ayaId);
    };

    gotoAya = (ayaId, opt = { sel: false, replace: true, keepMask: false }) => {
        if (ayaId === undefined) {
            ayaId = this.state.selectStart;
        }
        if (opt.sel) {
            this.selectAya(ayaId);
            if (opt.keepMask !== true) {
                this.hideMask();
            }
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
            isScrollable,
            isNarrow
        } = this.state;

        if (isScrollable) {
            return appWidth / 3;
        }

        if (isWide) {
            //popup fills up the margin of two pages view
            return appWidth - appHeight * 1.25 - 50;
        }
        if (isCompact) {
            //popup fills up the margin of one page view
            return appWidth - appHeight * 0.65 - 50;
        }

        //popup shown on top of pages
        return appWidth / pagesCount - (isNarrow ? 0 : 50);
    };

    selectedRange = () => {
        const { selectStart, selectEnd } = this.state;
        return {
            start: Math.min(selectStart, selectEnd),
            end: Math.max(selectStart, selectEnd)
        };
    };

    toggleBookmark = verse => {
        if (this.isBookmarked(verse)) {
            this.removeBookmark(verse);
        } else {
            this.addBookmark(verse);
        }
    };

    addBookmark = verse => {
        if (!this.bookmarksRef) {
            return;
        }
        if (verse === undefined) {
            verse = this.selectedRange().start;
        }
        this.bookmarksRef.child(verse).set(-new Date().getTime());
    };

    removeBookmark = verse => {
        if (!this.bookmarksRef) {
            return;
        }
        if (verse === undefined) {
            verse = this.state.selectStart;
        }
        this.bookmarksRef.child(verse).set(null);
    };

    setRangeRevised = range => {
        const rangeNodeRef = this.hifzRef.child(range.id);
        rangeNodeRef.once("value", snapshot => {
            let curr_range = snapshot.val();
            const now = Date.now();
            const timeSinceLastRevision = now - curr_range.ts;
            if (timeSinceLastRevision > 60 * 60 * 1000) {
                //One hour has passed since last revision
                curr_range.ts = now;
                curr_range.revs++;
                //Record new activity
                const today = new Date();
                const activityKey = Utils.dateKey(today);
                const activityPagesRef = this.activityRef.child(
                    activityKey + "/pages"
                );
                activityPagesRef.once("value", snapshot => {
                    let pages = snapshot.val() || 0;
                    pages += range.pages;
                    activityPagesRef.set(pages);
                });
            }
            rangeNodeRef.set(curr_range);
        });
    };

    logTypedVerse = verseId => {
        const verseText = this._normVerseList[verseId];
        const today = new Date();
        const activityKey = Utils.dateKey(today);
        const activityCharsRef = this.activityRef.child(activityKey + "/chars");
        activityCharsRef.once("value", snapshot => {
            let chars = snapshot.val() || 0;
            chars += verseText.replace(/\s/g, "").length;
            activityCharsRef.set(chars);
        });
    };

    addHifzRange = (startPage, sura, pages) => {
        //TODO: implement the merging logic in a Firebase function
        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const newRangeID =
            Utils.num2string(startPage, 3) + Utils.num2string(sura);
        let newRange = {
            revs: 0,
            startPage,
            endPage: startPage + pages - 1,
            pages: pages
        };
        let addNew = true;

        //Calculate average rev/page
        const mergeRangesRevs = (r1, r2) => {
            const totalRevs = r1.revs * r1.pages + r2.revs * r2.pages;
            const startPage = Math.min(r1.startPage, r2.startPage);
            const endPage = Math.max(r1.endPage, r2.endPage);
            const newTotalPages = endPage - startPage + 1;
            return Math.floor(totalRevs / newTotalPages);
        };

        //check if merging with intersecting ranges is required
        const suraRanges = this.state.hifzRanges
            .filter(r => r.sura === sura)
            .sort((r1, r2) => (r1.startPage > r2.startPage ? -1 : 1)); //reverse

        //check tailed ranges first
        suraRanges.forEach(r => {
            if (
                newRange.startPage == r.startPage &&
                newRange.pages == r.pages
            ) {
                //found exact range, skip it
                addNew = false;
                return;
            }

            if (
                newRange.startPage <= r.startPage &&
                newRange.endPage + 1 >= r.startPage
            ) {
                //intersecting with tailed range, append its pages (beyond our last page) and revs, and delete it
                newRange.endPage = Math.max(newRange.endPage, r.endPage);
                //Calcualte partial revs
                newRange.revs = mergeRangesRevs(newRange, r);
                newRange.pages = newRange.endPage - newRange.startPage + 1;
                //delete merged range
                this.hifzRef.child(r.id).set(null);
            }

            if (
                newRange.startPage > r.startPage &&
                newRange.startPage <= r.endPage + 1
            ) {
                //inersecting with prior range, add additional pages to it, don't add new one
                if (newRange.endPage > r.endPage) {
                    //Not completely inside an old range
                    let oldRange = Object.assign({}, r);
                    oldRange.revs = mergeRangesRevs(oldRange, newRange);
                    oldRange.endPage = newRange.endPage;
                    oldRange.pages = oldRange.endPage - oldRange.startPage + 1;

                    //Update old range
                    this.hifzRef.child(oldRange.id).set({
                        pages: oldRange.pages,
                        ts: fourteenDaysAgo,
                        revs: oldRange.revs
                    });

                    newRange = oldRange;
                }
                addNew = false;
            }
        });

        if (addNew) {
            this.hifzRef.child(newRangeID).set({
                pages: newRange.pages,
                ts: fourteenDaysAgo,
                revs: newRange.revs
            });
        }
    };

    deleteHifzRange = range => {
        this.hifzRef.child(range.id).set(null);
    };

    setModalPopup = (modalPopup = true) => {
        this.setState({ modalPopup });
    };

    setExpandedMenu = (expandedMenu = true) => {
        this.setState({ expandedMenu });
    };

    isBookmarked = verse => {
        if (verse === undefined) {
            verse = this.selectedRange().start;
        }
        return (
            undefined !==
            this.state.bookmarks.find(bookmarkInfo => bookmarkInfo.aya == verse)
        );
    };

    methods = {
        deleteHifzRange: this.deleteHifzRange,
        addHifzRange: this.addHifzRange,
        setRangeRevised: this.setRangeRevised,
        logTypedVerse: this.logTypedVerse,
        formatMessage: this.formatMessage,
        isBookmarked: this.isBookmarked,
        setExpandedMenu: this.setExpandedMenu,
        signOut: this.signOut,
        suraName: this.suraName,
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
        verseText: this.verseText,
        normVerseList: this.normVerseList,
        closePopup: this.closePopup,
        getActiveSide: this.getActiveSide,
        getCurrentPageIndex: this.getCurrentPageIndex,
        getSelectedText: this.getSelectedText,
        pagerWidth: this.pagerWidth,
        sideBarWidth: this.sideBarWidth,
        addBookmark: this.addBookmark,
        removeBookmark: this.removeBookmark,
        toggleBookmark: this.toggleBookmark,
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
    userRef = null;
    hifzRef = null;
    activityRef = null;
    bookmarksRef = null;
    onBookmarkUpdate = null;
    onActivityUpdate = null;
    onHifzUpdate = null;

    readFireData() {
        //unregister previous listener if exists
        if (this.bookmarksRef && this.onBookmarkUpdate) {
            this.bookmarksRef.off("value", this.onBookmarkUpdate);
        }
        if (this.hifzRef && this.onHifzUpdate) {
            this.hifzRef.off("value", this.onHifzUpdate);
        }

        if (this.activityRef && this.onActivityUpdate) {
            this.hifzRef.off("value", this.onActivityUpdate);
        }

        this.userRef = this.dbRef.child(`data/${this.state.user.uid}`);
        //Create new references
        this.hifzRef = this.userRef.child(`hifz`);
        this.bookmarksRef = this.userRef.child(`aya_marks`);

        this.activityRef = this.userRef.child(`activity`);

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
                              id: k,
                              sura,
                              startPage,
                              pages,
                              endPage,
                              date: hifzInfo.ts,
                              revs: hifzInfo.revs
                          };
                      })
                : [];
            this.setState({ hifzRanges });
        });

        this.onActivityUpdate = this.activityRef.on("value", snapshot => {
            const snapshot_val = snapshot.val();
            const pages = snapshot_val
                ? Object.keys(snapshot_val)
                      .sort((k1, k2) => (k1 < k2 ? 1 : -1))
                      .map(k => {
                          return { day: k, pages: snapshot_val[k].pages };
                      })
                : [];
            const chars = snapshot_val
                ? Object.keys(snapshot_val)
                      .sort((k1, k2) => (k1 < k2 ? 1 : -1))
                      .map(k => {
                          return { day: k, chars: snapshot_val[k].chars };
                      })
                : [];
            this.setState({
                daily: { chars, pages }
            });
        });
    }

    signOut() {
        this.hifzRanges.length = this.bookmarks.length = 0;
        firebase
            .auth()
            .signOut()
            .then(() => {
                firebase.auth().signInAnonymously();
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
                    // console.log(`Logged in userId ${JSON.stringify(user)}`);
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
export { AppContext, AppConsumer };
