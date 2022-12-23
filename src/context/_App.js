import firebase from "firebase";
import { Component, createContext } from "react";
import { injectIntl } from "react-intl";
import { withRouter } from "react-router-dom";

// const rc = localStorage.getItem("commands");
// const recentCommands = rc ? JSON.parse(rc) : [];
const initSidebarCommands = [
    // "AudioPlayer",
    "Indices",
    "Search",
    "Exercise",
    "Mask",
    "update_hifz",
    "Tafseer",
    "Bookmarks",
    "Goto",
    "Copy",
    // "Share",
    "Help",
];

//Default context values
const initialState = {
    user: null,
    hifzRanges: [],
    bookmarks: [],
    daily: {
        pages: [], //{date:'??',pages:123}
        chars: [], //{date:'??',chars:123}
    },

    selectStart: 0,
    selectEnd: 0,
    maskStart: -1,

    recentCommands: initSidebarCommands,
    // recentCommands:
    //     recentCommands.length === initSidebarCommands.length
    //         ? recentCommands
    //         : initSidebarCommands
};

export const AppContext = createContext(initialState);

class AppProvider extends Component {
    state = initialState;

    pushRecentCommand = (command) => {
        // if (
        //     [
        //         "Commands",
        //         "Play",
        //         "Pause",
        //         "Stop"
        //     ].includes(command)
        // ) {
        //     return;
        // }
        // let recentCommands = [
        //     command,
        //     ...this.state.recentCommands.filter(c => c !== command)
        // ];
        // setTimeout(() => this.setState({ recentCommands }), 1);
        // localStorage.setItem("commands", JSON.stringify(recentCommands));
    };

    toggleBookmark = (verse) => {
        if (this.isBookmarked(verse)) {
            return this.removeBookmark(verse);
        }
        return this.addBookmark(verse);
    };

    addBookmark = (verse) => {
        if (!this.bookmarksRef) {
            return 0;
        }
        // if (verse === undefined) {
        //     verse = this.selectedRange().start;
        // }
        this.bookmarksRef.child(verse).set(-new Date().getTime());
        return 1;
    };

    removeBookmark = (verse) => {
        if (!this.bookmarksRef) {
            return 0;
        }
        // if (verse === undefined) {
        //     verse = this.state.selectStart;
        // }
        this.bookmarksRef.child(verse).set(null);
        return -1;
    };

    // setRangeRevised = (range) => {
    //     const rangeNodeRef = this.hifzRef.child(range.id);
    //     rangeNodeRef.once("value", (snapshot) => {
    //         let curr_range = snapshot.val();
    //         const now = Date.now();
    //         const timeSinceLastRevision = now - curr_range.ts;
    //         if (timeSinceLastRevision > 60 * 60 * 1000) {
    //             //One hour has passed since last revision
    //             curr_range.ts = now;
    //             curr_range.revs++;
    //             //Record new activity
    //             const today = new Date();
    //             const activityKey = dateKey(today);
    //             const activityPagesRef = this.activityRef.child(
    //                 activityKey + "/pages"
    //             );
    //             activityPagesRef.once("value", (snapshot) => {
    //                 let pages = snapshot.val() || 0;
    //                 pages += range.pages;
    //                 activityPagesRef.set(pages);
    //             });
    //         }
    //         rangeNodeRef.set(curr_range);
    //     });
    // };

    //migrated
    // logTypedVerse = (verseId, words) => {
    //     const verseText = quranNormalizedText[verseId];
    //     const today = new Date();
    //     const activityKey = dateKey(today);
    //     const activityCharsRef = this.activityRef.child(activityKey + "/chars");
    //     const charsCount = words
    //         ? verseText.split(" ").slice(0, words).join("").length
    //         : verseText.replace(/\s/g, "").length;
    //     activityCharsRef.once("value", (snapshot) => {
    //         let chars = snapshot.val() || 0;
    //         chars += charsCount;
    //         activityCharsRef.set(chars);
    //     });

    //     return charsCount;
    // };

    // includesRanges = (sura, startPage, pages) => {
    //     const endPage = startPage + pages;
    //     const foundRanges = this.state.hifzRanges.filter(
    //         (r) =>
    //             r.sura === sura &&
    //             (r.startPage + 1).between(startPage, endPage) &&
    //             r.endPage.between(startPage, endPage)
    //     );
    //     return foundRanges.length;
    // };

    // addHifzRange = (startPage, sura, pages, overwrite = false) => {
    //     //TODO: implement the merging logic in a Firebase function
    //     if (!overwrite && this.includesRanges(sura, startPage, pages)) {
    //         return false;
    //     }

    //     const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    //     const newRangeID = num2string(startPage, 3) + num2string(sura);
    //     let newRange = {
    //         revs: 0,
    //         startPage,
    //         endPage: startPage + pages - 1,
    //         pages: pages,
    //     };
    //     let addNew = true;

    //     //Calculate average rev/page
    //     const mergeRangesRevs = (r1, r2) => {
    //         const totalRevs = r1.revs * r1.pages + r2.revs * r2.pages;
    //         const startPage = Math.min(r1.startPage, r2.startPage);
    //         const endPage = Math.max(r1.endPage, r2.endPage);
    //         const newTotalPages = endPage - startPage + 1;
    //         return Math.floor(totalRevs / newTotalPages);
    //     };

    //     //check if merging with intersecting ranges is required
    //     const suraRanges = this.state.hifzRanges
    //         .filter((r) => r.sura === sura)
    //         .sort((r1, r2) => (r1.startPage > r2.startPage ? -1 : 1)); //reverse

    //     //check tailed ranges first
    //     suraRanges.forEach((r) => {
    //         if (
    //             newRange.startPage === r.startPage &&
    //             newRange.pages === r.pages
    //         ) {
    //             //found exact range, skip it
    //             addNew = false;
    //             return;
    //         }

    //         if (
    //             newRange.startPage <= r.startPage &&
    //             newRange.endPage + 1 >= r.startPage
    //         ) {
    //             //intersecting with tailed range,
    //             //append its pages (beyond our last page) and revs, and delete it
    //             newRange.endPage = Math.max(newRange.endPage, r.endPage);
    //             //calculate partial revs
    //             newRange.revs = mergeRangesRevs(newRange, r);
    //             newRange.pages = newRange.endPage - newRange.startPage + 1;
    //             //delete merged range
    //             this.hifzRef.child(r.id).set(null);
    //         }

    //         if (
    //             newRange.startPage > r.startPage &&
    //             newRange.startPage <= r.endPage + 1
    //         ) {
    //             //intersecting with prior range, add additional pages to it, don't add new one
    //             if (newRange.endPage > r.endPage) {
    //                 //Not completely inside an old range
    //                 let oldRange = Object.assign({}, r);
    //                 oldRange.revs = mergeRangesRevs(oldRange, newRange);
    //                 oldRange.endPage = newRange.endPage;
    //                 oldRange.pages = oldRange.endPage - oldRange.startPage + 1;

    //                 //Update old range
    //                 this.hifzRef.child(oldRange.id).set({
    //                     pages: oldRange.pages,
    //                     ts: fourteenDaysAgo,
    //                     revs: oldRange.revs,
    //                 });

    //                 newRange = oldRange;
    //             }
    //             addNew = false;
    //         }
    //     });

    //     if (addNew) {
    //         this.hifzRef.child(newRangeID).set({
    //             pages: newRange.pages,
    //             ts: fourteenDaysAgo,
    //             revs: newRange.revs,
    //         });
    //     }
    //     return true;
    // };

    // deleteHifzRange = (range) => {
    //     this.hifzRef.child(range.id).set(null);
    // };

    // isBookmarked = (verse) => {
    //     // if (verse === undefined) {
    //     //     verse = this.selectedRange().start;
    //     // }
    //     return (
    //         undefined !==
    //         this.state.bookmarks.find(
    //             // eslint-disable-next-line eqeqeq
    //             (bookmarkInfo) => bookmarkInfo.aya == verse
    //         )
    //     );
    // };

    // suraRanges = (sura) =>
    //     this.state.hifzRanges
    //         .filter((r) => r.sura === sura)
    //         .sort((r1, r2) => (r1.startPage > r2.startPage ? 1 : -1));

    methods = {
        // suraRanges: this.suraRanges,
        // deleteHifzRange: this.deleteHifzRange,
        // addHifzRange: this.addHifzRange,
        // setRangeRevised: this.setRangeRevised,
        // logTypedVerse: this.logTypedVerse,
        // isBookmarked: this.isBookmarked,
        signOut: this.signOut,
        pushRecentCommand: this.pushRecentCommand,
        // addBookmark: this.addBookmark,
        // removeBookmark: this.removeBookmark,
        // toggleBookmark: this.toggleBookmark,
    };

    componentWillUnmount() {
        // this.unregisterAuthObserver && this.unregisterAuthObserver();
        // this.bookmarksRef && this.onBookmarkUpdate();
        // this.onHifzUpdate && this.onHifzUpdate();
        // this.onActivityUpdate && this.onActivityUpdate();
    }

    dbRef = null;
    userRef = null;
    hifzRef = null;
    activityRef = null;
    // bookmarksRef = null;
    // onBookmarkUpdate = null;
    // onActivityUpdate = null;
    // onHifzUpdate = null;

    readFireData(user) {
        //unregister previous listener if exists
        // if (this.bookmarksRef && this.onBookmarkUpdate) {
        //     this.bookmarksRef.off("value", this.onBookmarkUpdate);
        // }
        // if (this.hifzRef && this.onHifzUpdate) {
        //     this.hifzRef.off("value", this.onHifzUpdate);
        // }

        // if (this.activityRef && this.onActivityUpdate) {
        //     this.hifzRef.off("value", this.onActivityUpdate);
        // }

        this.userRef = this.dbRef.child(`data/${user.uid}`);
        //Create new references
        this.hifzRef = this.userRef.child(`hifz`);
        // this.bookmarksRef = this.userRef.child(`aya_marks`);

        this.activityRef = this.userRef.child(`activity`);

        //create new "value" listeners
        //     this.onBookmarkUpdate = this.bookmarksRef.on("value", (snapshot) => {
        //         if (!snapshot) {
        //             return;
        //         }
        //         const snapshot_val = snapshot.val();
        //         const bookmarks = !snapshot_val
        //             ? []
        //             : Object.keys(snapshot_val)
        //                   .sort((k1, k2) =>
        //                       snapshot_val[k1] < snapshot_val[k2] ? -1 : 1
        //                   )
        //                   .map((k) => ({ aya: k, ts: snapshot_val[k] }));
        //         this.setState({ bookmarks });
        //     });

        //     this.onHifzUpdate = this.hifzRef.on("value", (snapshot) => {
        //         if (!snapshot) {
        //             return;
        //         }
        //         const snapshot_val = snapshot?.val();
        //         const hifzRanges = snapshot_val
        //             ? Object.keys(snapshot_val)
        //                   .sort((k1, k2) =>
        //                       snapshot_val[k1].ts < snapshot_val[k2].ts ? -1 : 1
        //                   )
        //                   .map((k) => {
        //                       const sura = parseInt(k.substr(3, 3));
        //                       const startPage = parseInt(k.substr(0, 3));
        //                       const hifzInfo = snapshot_val[k];
        //                       const pages = hifzInfo.pages;
        //                       const endPage = startPage + pages - 1;
        //                       return {
        //                           id: k,
        //                           sura,
        //                           startPage,
        //                           pages,
        //                           endPage,
        //                           date: hifzInfo.ts,
        //                           revs: hifzInfo.revs,
        //                       };
        //                   })
        //             : [];
        //         this.setState({ hifzRanges });
        //     });

        //     this.onActivityUpdate = this.activityRef.on("value", (snapshot) => {
        //         if (!snapshot) {
        //             return;
        //         }
        //         const snapshot_val = snapshot.val();
        //         const pages = snapshot_val
        //             ? Object.keys(snapshot_val)
        //                   .sort((k1, k2) => (k1 < k2 ? 1 : -1))
        //                   .map((k) => {
        //                       return { day: k, pages: snapshot_val[k].pages };
        //                   })
        //             : [];
        //         const chars = snapshot_val
        //             ? Object.keys(snapshot_val)
        //                   .sort((k1, k2) => (k1 < k2 ? 1 : -1))
        //                   .map((k) => {
        //                       return { day: k, chars: snapshot_val[k].chars };
        //                   })
        //             : [];
        //         this.setState({
        //             daily: { chars, pages },
        //         });
        //     });
    }

    signOut() {
        this.hifzRanges.length = this.bookmarks.length = 0;
        return firebase.auth().signOut();
        // .then(() => {
        //     firebase.auth().signInAnonymously();
        // });
    }

    // componentDidUpdate(prevProps, prevState) {
    // }

    componentDidMount() {
        this.unregisterAuthObserver = firebase
            .auth()
            .onAuthStateChanged((user) => {
                this.setState({ user });
                if (user == null) {
                    //sign in anonymously
                    firebase.auth().signInAnonymously();
                } else {
                    this.readFireData(user);
                    // console.log(`Logged in 	d ${JSON.stringify(user)}`);
                }
            });

        this.dbRef = firebase.app().database().ref();

        // setTimeout(() => {
        //     const ayaId = getPageFirstAyaId(this.getCurrentPageIndex());
        //     this.selectAya(ayaId);
        // });

        // const { history } = this.props;
        // history.listen((location) => {
        //     analytics.setCurrentScreen(location.pathname);
        //     // analytics.logEvent("page_view");
        // });
    }

    render() {
        return (
            <AppContext.Provider
                value={{
                    ...this.props,
                    ...this.state,
                    ...this.methods,
                }}
            >
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

//Create the context consumer generator function
export const AppConsumer = (Component) =>
    function AppConsumerGen(props) {
        return (
            <AppContext.Consumer>
                {(state) => <Component {...props} app={state} />}
            </AppContext.Consumer>
        );
    };

export default injectIntl(withRouter(AppProvider));
