import {applyMiddleware,compose,createStore} from 'redux';
import reducer from '../reducers/reducer'; // 相当于仓库管理员
import thunk from 'redux-thunk';
import {routerMiddleware} from 'react-router-redux';

let createHistory = require('history').createHashHistory;
let history = createHistory();   // 初始化history
let routerWare = routerMiddleware(history);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer,composeEnhancers(applyMiddleware(thunk,routerWare))); // 创建仓库放入管理员

export default store;
