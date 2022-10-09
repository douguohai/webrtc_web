import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AppRoom from "./AppRoom";
import { Provider } from 'react-redux'
import store from "./store/store"


ReactDOM.render(
  <Provider store={store}>
  <Router path="/" component={Login}>
    <Switch>
      <Route exact path="/">
        <Login />
      </Route>
      <Route path="/room">
        <AppRoom />
      </Route>
    </Switch>
  </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
