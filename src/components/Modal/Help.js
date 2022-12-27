import React, { useEffect, useState } from "react";
import { FormattedMessage as Message } from "react-intl";

const Help = () => {
    const [unsecureLink, setUnsecureLink] = useState(null);
    // useEffect(() => {
    //   const newLink = window.location.href.replace("https://", "http://");
    //   if (newLink !== window.location.href) {
    //     setUnsecureLink(newLink);
    //   }
    // }, []);

    return (
        <>
            <div className="Title">
                <Message id="help" />
            </div>
            <div className="PopupBody">
                <div>
                    <Message id="add_to_home" />
                </div>
                <hr />

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
                {unsecureLink && (
                    <div>
                        <hr />
                        <Message
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

export default Help;
