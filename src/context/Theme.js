import React, { Component } from "react";

const ThemeState = {
    theme: localStorage.getItem("theme") || "Default"
};

const ThemeContext = React.createContext(ThemeState);

class ThemeProvider extends Component {
    state = ThemeState;

    setTheme = theme => {
        this.setState({ theme });
        localStorage.setItem("theme", theme);
    };

    toggleTheme = () => {
        this.setTheme(this.state.theme === "Default" ? "Dark" : "Default");
    };

    methods = {
        setTheme: this.setTheme,
        toggleTheme: this.toggleTheme
    };

    render() {
        return (
            <ThemeContext.Provider
                value={{
                    ...this.props,
                    ...this.state,
                    ...this.methods
                }}
            >
                {this.props.children}
            </ThemeContext.Provider>
        );
    }
}

const ThemeConsumer = Component =>
    function ThemeContextWrapper(props) {
        return (
            <ThemeContext.Consumer>
                {state => <Component {...props} themeContext={state} />}
            </ThemeContext.Consumer>
        );
    };

export default ThemeProvider;

export { ThemeConsumer, ThemeContext };
