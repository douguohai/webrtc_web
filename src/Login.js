import React,{ useEffect } from "react";
import { Form, Input, Button,message } from "antd";
import "antd/dist/antd.css";
import {connect}  from 'react-redux';
import {doLoginAction}  from  './actions/action.js';
import {login} from "./api/api.js"

function Login(props) {

  let {doLogin,username}  = props;

  const onFinishFailed = (e) => {
    console.log("Failed:", e);
  };

  const onFinish = (e) => {
    doLogin(e)
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        onFinish={(e) => onFinish(e)}
        onFinishFailed={(e) => onFinishFailed(e)}
      >
        <Form.Item
          label="用户名"
          name="username"
          initialValue={username}
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}


//映射props
const mapStateToProps = (state) => {
  console.log(state)
  return {
      username:state.userinfo.username,
      list:state.list
  }
}

const mapDispatchToProps =  (dispatch)=>{
  return  {
      doLogin(param){
        var param={username:param.username,password:'12345'};
        login(JSON.stringify(param)).then(res=>{
          if(res.code === 0){
              message.info(res.msg);
              let action = doLoginAction({
                username:param.username,
                password:param.password,
                token:res.data
              })
              dispatch(action)
          }else{
              message.error(res.msg);
          }
      }).catch(e=>console.log("请求异常",e))
      
      }
  }
}

const VisibleLogin = connect(mapStateToProps, mapDispatchToProps)(Login)

export default VisibleLogin;
