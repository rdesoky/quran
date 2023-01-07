import React, { useState } from "react";
import { FormattedMessage as Message } from "react-intl";
import { CommandButton } from "../CommandButton";

const Help = () => {
    // const [unsecureLink, setUnsecureLink] = useState(null);
    // useEffect(() => {
    //   const newLink = window.location.href.replace("https://", "http://");
    //   if (newLink !== window.location.href) {
    //     setUnsecureLink(newLink);
    //   }
    // }, []);
    const trigger = "Help";

    return (
        <>
            <div className="Title">
                <Message id="help" />
            </div>
            <div className="PopupBody">
                <div id="GooglePlayBadge">
                    <a
                        href="https://play.google.com/store/apps/details?id=com.muslim_web.quran"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            id="GooglePlay"
                            src="/images/google-play.png"
                            alt="get it on Google Play"
                        />
                    </a>
                </div>
                <hr />
                {/* <div>
                    <Message id="add_to_home" />
                </div>
                <hr /> */}

                <div>
                    <Message
                        id="contact_us"
                        values={{
                            email: (
                                <div>
                                    <a href="mailto:quran.hafiz.app@gmail.com">
                                        quran.hafiz.app@gmail.com
                                    </a>
                                </div>
                            ),
                        }}
                    />
                </div>
                <hr />
                <div>
                    <Message
                        id="credits"
                        values={{
                            link: (
                                // eslint-disable-next-line react/jsx-no-target-blank
                                <a href="https://everyayah.com" target="_blank">
                                    everyayah.com
                                </a>
                            ),
                        }}
                    />
                </div>
                <hr />
                <div>
                    <CommandButton
                        {...{ command: "Share", trigger, showLabel: true }}
                    />
                </div>
            </div>
        </>
    );
};

export default Help;
