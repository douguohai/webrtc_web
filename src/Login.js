import React,{ useEffect } from "react";
import { Form, Input, Button } from "antd";
import { useHistory } from "react-router-dom";
import "antd/dist/antd.css";

export default function Login() {
  let history = useHistory();

  const onFinishFailed = (e) => {
    console.log("Failed:", e);
  };

  const onFinish = (e) => {
    console.log("Success:", e);
    history.push({
      pathname: "/room",
      state: {
        username: e.username,
      },
    });
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
