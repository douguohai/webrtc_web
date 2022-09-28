import React,{ useEffect } from "react";
import { Form, Input, Button } from "antd";
import "antd/dist/antd.css";
import {connect}  from 'react-redux';
import {changeInputAction,addItemAction,deleteItemAction}  from  './dispatch/actionCreatores';
import {push} from 'react-router-redux';

function Login(props) {

  let {inputValue,changeInput,addBtn,list,deleteItem}  = props;

  const onFinishFailed = (e) => {
    console.log("Failed:", e);
  };

  const onFinish = (e) => {
    changeInput(e)
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        initialValues={{ remember: true }}
        onFinish={(e) => onFinish(e)}
        onFinishFailed={(e) => onFinishFailed(e)}
      >
        <Form.Item
          label="Username"
          name="username"
          value={inputValue}
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
  return {
      inputValue:state.inputValue,
      list:state.list
  }
}

const mapDispatchToProps =  (dispatch)=>{
  return  {
      changeInput(e){
        let action = changeInputAction(e)
        dispatch(action)
        dispatch( push('/room'))
      },
      addBtn(){
          let action = addItemAction();
          dispatch(action)
      },
      deleteItem(index){
          let action = deleteItemAction(index);
          dispatch(action)
      }
  }
}

const VisibleLogin = connect(mapStateToProps, mapDispatchToProps)(Login)

export default VisibleLogin;
