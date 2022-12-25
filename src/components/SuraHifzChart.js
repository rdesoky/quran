import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { analytics } from "../services/Analytics";
import { selectSuraRanges } from "../store/dbSlice";
import { selectActivePage } from "../store/layoutSlice";
import { gotoPage } from "../store/navSlice";
import { getArSuraName, sura_info } from "./../services/QData";

const dayLength = 24 * 60 * 60 * 1000;

export const SuraHifzChart = ({
    sura,
    range,
    pages = true,
    onClickPage,
    trigger = "header_chapter_index",
}) => {
    const suraRanges = useSelector(selectSuraRanges(sura));
    const [activeRange, setActiveRange] = useState(null);

    const suraIndex = sura !== undefined ? sura : range.sura;
    const suraInfo = sura_info[suraIndex];
    const suraPages = suraInfo.ep - suraInfo.sp + 1;
    const pageList = Array(suraPages).fill(0);
    const dispatch = useDispatch();
    const history = useHistory();
    const activePage = useSelector(selectActivePage);
    // const pageWidth = `${100 / suraPages}%`;

    useEffect(() => {
        if (range) {
            setActiveRange(range);
        }
    }, [range]);

    const suraStartPage = suraInfo.sp;

    const onClickChart = ({ target }) => {
        const page = parseInt(target.getAttribute("page"));
        if (onClickPage) {
            onClickPage(suraStartPage + page);
        } else {
            dispatch(
                gotoPage(history, suraStartPage + page - 1, {
                    replace: false,
                    sel: true,
                })
            );
        }
        analytics.logEvent("chart_page_click", {
            trigger,
            page,
            chapter_num: sura + 1,
            chapter: getArSuraName(sura),
        });
    };

    return (
        <div className="SuraHifzChart" onClick={onClickChart}>
            <div className="HifzRanges">
                {suraRanges.map((r, i) => {
                    const rangeStart = r.startPage - suraInfo.sp + 1;
                    const start = (100 * rangeStart) / suraPages;
                    const width = (100 * r.pages) / suraPages;
                    let age,
                        ageClass = "NoHifz";
                    if (r.date !== undefined) {
                        age = Math.floor((Date.now() - r.date) / dayLength);
                        ageClass =
                            age <= 7
                                ? "GoodHifz"
                                : age <= 14
                                ? "FairHifz"
                                : "WeakHifz";
                    }
                    return (
                        <div
                            key={`${r.startPage}-${r.sura}`}
                            className={"SuraRange"
                                .appendWord(ageClass)
                                .appendWord(
                                    "active",
                                    activeRange &&
                                        activeRange.startPage === r.startPage &&
                                        activeRange.sura === r.sura
                                )}
                            style={{
                                right: `${start}%`,
                                width: `${width}%`,
                            }}
                        />
                    );
                })}
            </div>
            <div className="PageThumbs">
                {pages
                    ? pageList.map((z, i) => {
                          const activeClass =
                              activePage === i + suraInfo.sp - 1
                                  ? "ActivePage"
                                  : "";
                          return (
                              <div
                                  key={i}
                                  page={i}
                                  className={"PageThumb".appendWord(
                                      activeClass
                                  )}
                                  title={i + 1}
                                  //   style={{
                                  //       right: `${(100 * i) / suraPages}%`,
                                  //       width: pageWidth
                                  //   }}
                              />
                          );
                      })
                    : null}
            </div>
        </div>
    );
};
