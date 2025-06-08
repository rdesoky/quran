import firebase from "firebase";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectUser,
    setActivities,
    setBookmarks,
    setHifzRanges,
    setUser,
} from "./store/dbSlice";
import { onResize } from "./store/layoutSlice";

export default function useInitApp() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    useEffect(() => {
        dispatch(
            onResize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        );
    }, [dispatch]);

    // useEffect(() => {
    //     console.log(`history changed: ${history?.location?.pathname}`);
    // }, [history?.location]);

    useEffect(() => {
        const onStateChangeObserver = firebase
            .auth()
            .onAuthStateChanged((user) => {
                // this.setState({ user });
                if (user == null) {
                    //No user yet, signing in anonymously
                    firebase.auth().signInAnonymously();
                } else {
                    //signed in
                    const { uid, email, displayName, photoURL, isAnonymous } =
                        user;
                    dispatch(
                        setUser({
                            uid,
                            email,
                            displayName,
                            photoURL,
                            isAnonymous,
                        })
                    );
                    // dispatch(
                    //     readUserData(user, firebase.app().database().ref())
                    // );
                    // this.readFireData(user);
                    // console.log(`Logged in userId ${JSON.stringify(user)}`);
                }
            });
        return () => {
            onStateChangeObserver();
        };
    }, [dispatch]);

    useEffect(() => {
        if (!user) {
            return;
        }
        const dbRef = firebase.app().database().ref();
        const userRef = dbRef.child(`data/${user.uid}`);
        const offBookmarksUpdate = userRef
            .child(`aya_marks`)
            ?.on("value", (snapshot) => {
                if (snapshot == null) {
                    return;
                }
                const snapshot_val = snapshot.val();
                const bookmarks: Bookmark[] = !snapshot_val
                    ? []
                    : Object.keys(snapshot_val)
                          .sort((k1, k2) =>
                              snapshot_val[k1] < snapshot_val[k2] ? -1 : 1
                          )
                          .map((k) => ({ aya: k, ts: snapshot_val[k] }));
                dispatch(setBookmarks({ bookmarks }));
            });

        const offHifzUpdate = userRef.child(`hifz`)?.on("value", (snapshot) => {
            if (!snapshot) {
                return;
            }
            const snapshot_val = snapshot.val();
            const hifzRanges = snapshot_val
                ? Object.keys(snapshot_val)
                      .sort((k1, k2) =>
                          snapshot_val[k1].ts < snapshot_val[k2].ts ? -1 : 1
                      )
                      .map((k) => {
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
                              revs: hifzInfo.revs,
                          };
                      })
                : [];
            dispatch(setHifzRanges({ hifzRanges }));
        });

        const offActivityUpdate = userRef
            .child(`activity`)
            ?.on("value", (snapshot) => {
                if (!snapshot) {
                    return;
                }
                const snapshot_val = snapshot.val();
                const pages = snapshot_val
                    ? Object.keys(snapshot_val)
                          .sort((k1, k2) => (k1 < k2 ? 1 : -1))
                          .map((k) => {
                              return { day: k, pages: snapshot_val[k].pages };
                          })
                    : [];
                const chars = snapshot_val
                    ? Object.keys(snapshot_val)
                          .sort((k1, k2) => (k1 < k2 ? 1 : -1))
                          .map((k) => {
                              return { day: k, chars: snapshot_val[k].chars };
                          })
                    : [];
                dispatch(
                    setActivities({
                        daily: { chars, pages },
                    })
                );
            });

        return () => {
            offBookmarksUpdate?.(null);
            offHifzUpdate?.(null);
            offActivityUpdate?.(null);
        };
    }, [dispatch, user]);
}
