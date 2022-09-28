import {CHANGE_INPUT_TYPE,ADD_ITEM_TYPE,DELETE_ITEM_TYPE} from "../action/actionType"
import { message } from 'antd';
import {login} from "../api/api.js"
const defaultObj = {
    userinfo:{
        username:"",
        password:"",
        token:""
    }
}

const reducers =  (state = defaultObj,action)=>{
    // 监听 dispatch分发 执行 changeInput
    if(action.type === CHANGE_INPUT_TYPE){
        var param={username:action.value.username,password:'12345'};
        console.log(param)
        login(JSON.stringify(param)).then(res=>{
            if(res.code === 0){
                message.info(res.msg);
                state.userinfo={
                    username:param.username,
                    password:param.password,
                    token:res.data
                }
                console.log(state)
            }else{
                message.error(res.msg);
            }
        }).catch(e=>console.log("请求异常",e))
        return state;
    }
    // 监听新增 dispatch分发
    if(action.type === ADD_ITEM_TYPE){
        let newState = JSON.parse(JSON.stringify(state))
        newState.list.push(newState.inputValue)
        newState.inputValue = ''
        return newState;
    }
     // 监听删除 dispatch分发
    if(action.type === DELETE_ITEM_TYPE){
        let newState = JSON.parse(JSON.stringify(state))
        newState.list.splice(action.index,1)
        return newState;
    }
    return state;
}

export default reducers;
