import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "../../context/App";

const Help = () => {
  const [unsecureLink, setUnsecureLink] = useState(null);
  useEffect(() => {
    const newLink = window.location.href.replace("https://", "http://");
    if (newLink !== window.location.href) {
      setUnsecureLink(newLink);
    }
  }, []);

  return (
    <>
      <div className="Title">
        <String id="help" />
      </div>
      <div className="PopupBody">
        <div>
          <String
            id="contact_us"
            values={{
              email: (
                <div>
                  <a href="mailto:webmaster@muslim-web.com">
                    webmaster@muslim-web.com
                  </a>
                </div>
              ),
            }}
          />
        </div>
        <hr />
        <div>
          <String
            id="credits"
            values={{
              link: (
                <a href="https://everyayah.com" target="_blank">
                  everyayah.com
                </a>
              ),
            }}
          />
        </div>
        {unsecureLink && (
          <div>
            <hr />
            <String
              id="audio_fix"
              values={{
                link: <a href={unsecureLink}>{unsecureLink}</a>,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AppConsumer(Help);
