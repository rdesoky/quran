import React, { useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppContext } from "../../context/App";
import { PlayerContext } from "../../context/Player";
import ReciterName from "./../AudioPlayer/ReciterName";
import { ListReciters } from "../../services/AudioData";
import Switch from "react-switch";
import { VerseInfo } from "../Widgets";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import { analytics } from "../../services/Analytics";
import {
  selectLang,
  selectTheme,
  setLang,
  setTheme,
} from "../../store/settingsSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExerciseLevel,
  selectExerciseMemorized,
  selectRandomAutoRecite,
  setExerciseLevel,
  setExerciseMemorized,
  setRandomAutoRecite,
} from "../../store/settingsSlice";
import {
  selectAppHeight,
  selectIsNarrow,
  selectPopupWidth,
} from "../../store/appSlice";
import { selectPopup } from "../../store/uiSlice";

const Settings = () => {
  const player = useContext(PlayerContext);
  const app = useContext(AppContext);
  const lang = useSelector(selectLang);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const popupWidth = useSelector(selectPopupWidth);
  const appHeight = useSelector(selectAppHeight);
  const isNarrow = useSelector(selectIsNarrow);
  const popup = useSelector(selectPopup);

  let popupBody;

  const recitersList = ListReciters("ayaAudio");
  const [buttonWidth, outerMargin, scrollBarWidth] = [90, 30, 20];
  const recitersListWidth = popupWidth - outerMargin - scrollBarWidth;
  const recitersPerRow = Math.floor(recitersListWidth / buttonWidth);
  const recitersRowsCount = Math.floor(
    (recitersList.length - 1) / recitersPerRow + 1
  );
  const recitersHeight = recitersRowsCount * buttonWidth + 15;
  const centerPadding = (recitersListWidth - recitersPerRow * buttonWidth) / 2;

  const onChangeRepeat = ({ currentTarget }) => {
    const repeat = currentTarget.value;
    player.setRepeat(parseInt(repeat));
    analytics.logEvent("set_repeat", { repeat, trigger: app.popup });
  };

  const updateFollowPlayer = (checked) => {
    player.setFollowPlayer(checked);
    analytics.logEvent(checked ? "set_follow_player" : "set_unfollow_player", {
      trigger: popup,
    });
  };

  const selectReciter = ({ currentTarget }) => {
    const reciter = currentTarget.getAttribute("reciter");
    player.changeReciter(reciter);
    popupBody.scrollTop = 0;
    analytics.logEvent("set_reciter", { reciter, trigger: app.popup });
  };

  const updateTheme = (checked) => {
    const theme_name = checked ? "Dark" : "Default";
    dispatch(setTheme(theme_name));
    localStorage.setItem("theme", theme_name);
    analytics.logEvent("set_theme", { theme_name, trigger: app.popup });
  };

  const updateLang = ({ currentTarget }) => {
    const lang = currentTarget.value;
    dispatch(setLang(lang));
    analytics.logEvent("set_lang", { lang, trigger: app.popup });
  };

  return (
    <>
      <div className="Title">
        <VerseInfo trigger="settings_title" verse={player.playingAya} />
        {isNarrow ? (
          <PlayerButtons trigger="settings_title" showReciter={false} />
        ) : (
          ""
        )}
      </div>
      <div
        ref={(ref) => {
          popupBody = ref;
        }}
        className="PopupBody"
        style={{
          height: appHeight - 80,
        }}
      >
        <div className="OptionRow">
          <label>
            <span>
              <Icon icon={faLanguage} />
            </span>
            <select onChange={updateLang} value={lang}>
              <option value="ar">عربي</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <hr />
        <div className="OptionRow">
          <label>
            <span>
              <String id="dark_mode" />
            </span>
            <Switch
              height={22}
              width={42}
              onChange={updateTheme}
              checked={theme === "Dark"}
            />
          </label>
        </div>
        <hr />
        <div>
          <String id="random_exercise" />:
        </div>
        <ExerciseSettings />
        <hr />
        <div className="OptionRow">
          <label>
            <span>
              <String id="followPlayer" />
            </span>
            <Switch
              height={22}
              width={42}
              onChange={updateFollowPlayer}
              checked={player.followPlayer}
              // disabled={player.repeat == 1}
            />
          </label>
        </div>
        <div className="OptionRow">
          <label>
            <String id="repeat" />
            <select
              // ref={(ref) => {
              //     selectRepeat = ref;
              // }}
              onChange={onChangeRepeat}
              value={player.repeat}
            >
              <String id="no_repeat">
                {(label) => <option value={0}>{label}</option>}
              </String>
              <String id="selection">
                {(label) => <option value={1}>{label}</option>}
              </String>
              <String id="page">
                {(label) => <option value={2}>{label}</option>}
              </String>
              <String id="sura">
                {(label) => <option value={3}>{label}</option>}
              </String>
              <String id="part">
                {(label) => <option value={4}>{label}</option>}
              </String>
            </select>
          </label>
        </div>
        <div
          className="RecitersList"
          style={{
            height: recitersHeight,
          }}
        >
          {recitersList.map((reciter, index) => {
            const row = Math.floor(index / recitersPerRow);
            const top = row * 90;
            const col = index - row * recitersPerRow;
            // const left = col * buttonWidth + centerPadding;
            const left =
              recitersListWidth -
              (col * buttonWidth + centerPadding) -
              buttonWidth;
            return (
              <button
                reciter={reciter}
                key={reciter}
                className={
                  "ReciterButton" +
                  (player.reciter === reciter ? " Selected" : "")
                }
                onClick={selectReciter}
                style={{
                  top,
                  left,
                }}
              >
                <img
                  className="ReciterIcon"
                  src={process.env.PUBLIC_URL + "/images/" + reciter + ".jpg"}
                  alt="reciter"
                />
                <div>
                  <ReciterName id={reciter} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const ExerciseSettings = () => {
  const app = useContext(AppContext);
  const dispatch = useDispatch();
  const exerciseLevel = useSelector(selectExerciseLevel);
  const randomAutoRecite = useSelector(selectRandomAutoRecite);
  const exerciseMemorized = useSelector(selectExerciseMemorized);

  const updateExerciseLevel = ({ currentTarget }) => {
    const exerciseLevel = parseInt(currentTarget.value);
    // settings.setExerciseLevel(exerciseLevel);
    dispatch(setExerciseLevel(exerciseLevel));
    localStorage.setItem("exerciseLevel", exerciseLevel);
  };

  const updateExerciseMemorized = (checked) => {
    dispatch(setExerciseMemorized(checked));
    localStorage.setItem("exerciseMemorized", checked);
  };

  const updateRandomAutoRecite = (checked) => {
    dispatch(setRandomAutoRecite(checked));
    localStorage.setItem("randomAutoRecite", checked);
  };

  return (
    <>
      <div className="OptionRow">
        <label>
          <String id="exercise_level" />
          <select onChange={updateExerciseLevel} value={exerciseLevel}>
            <option value={0}>
              {app.intl.formatMessage({
                id: "beginner_level",
              })}
            </option>
            <option value={1}>
              {app.intl.formatMessage({
                id: "moderate_level",
              })}
            </option>
            <option value={2}>
              {app.intl.formatMessage({ id: "high_level" })}
            </option>
            <option value={3}>
              {app.intl.formatMessage({
                id: "advanced_level",
              })}
            </option>
          </select>
        </label>
      </div>
      <div className="OptionRow">
        <label>
          <span>
            <String id="exercise_memorized" />
          </span>
          <Switch
            height={22}
            width={42}
            onChange={updateExerciseMemorized}
            checked={exerciseMemorized || false}
          />
        </label>
      </div>
      <div className="OptionRow">
        <label>
          <span>
            <String id="random_auto_recite" />
          </span>
          <Switch
            height={22}
            width={42}
            onChange={updateRandomAutoRecite}
            checked={randomAutoRecite || false}
          />
        </label>
      </div>
    </>
  );
};
export default Settings;
