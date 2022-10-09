import {DO_LOGIN} from "../actions/actionType.js"
import { message } from 'antd';
import {login} from "../api/api.js"
const defaultObj = {
    userinfo:{
        username:"douguohai",
        password:"3232",
        token:"3232"
    }
}

const reducers =  (state = defaultObj,action)=>{
    console.log("reduce==",action.type)
    // 监听 dispatch分发 执行 changeInput
    if(action.type === DO_LOGIN){
        console.log(action.value)
        console.log("pre=="+state)
        state.userinfo.username=action.value.username+action.value.token
        console.log(state)
        return state;
    }
    return state;
}

export default reducers;
