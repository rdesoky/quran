import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "../../context/App";

const Help = () => {
    return (
        <>
            <div className="Title">
                <String id="help" />
            </div>
            <div className="PopupBody">
                <String
                    id="contact_us"
                    values={{
                        email: (
                            <div>
                                <a href="mailto:webmaster@muslim-web.com">
                                    webmaster@muslim-web.com
                                </a>
                            </div>
                        )
                    }}
                />
            </div>
        </>
    );
};

export default AppConsumer(Help);
