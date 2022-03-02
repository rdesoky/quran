import React, { useState, useEffect } from "react";
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
