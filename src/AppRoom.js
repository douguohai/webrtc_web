import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Space, message } from "antd";
import { useLocation } from "react-router-dom";
import "antd/dist/antd.css";
import Utils from "./utils/Utils";
import { getSocket } from "./utils/SocketCoon";

const mediaStreamConstraints = {
  video: true,
  audio: true,
};

const rtcOfferOptions = {
  iceRestart: false,
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

var localStream = null;

var remoteStream = null;

var localCoon = new RTCPeerConnection();

var remoteCoon = new RTCPeerConnection();

var socket = null;

/**
 * 代表本地视屏
 */
const LOCAL_MARK = 0;

/**
 * 代表远程视屏
 */
const REMOTE_MARK = 1;

export default function AppRoom(props) {
  const [local_desc, setLocalDesc] = useState({});
  const [remote_desc, setRemoteDesc] = useState({});
  const [createdRoom, setCreatedRoom] = useState({});
  const [userName, setUserName] = useState("");
  const local_movie = useRef(null);
  const remote_movie = useRef(null);

  const location = useLocation();

  useEffect(() => {
    setUserName(location.state.username);
  }, [location]);

  localCoon.onicecandidate = (event) => {
    const iceCandidate = event.candidate;
    if (iceCandidate != null) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);

      remoteCoon
        .addIceCandidate(newIceCandidate)
        .then(() => {
          console.log("remoteCoon addIceCandidate success", event);
        })
        .catch((e) => {
          console.log("remoteCoon addIceCandidate error", e);
        });
    }
  };

  localCoon.ontrack = (ev) => {
    console.log("localCoon.ontrack", ev);
    if (ev.streams && ev.streams[0]) {
      local_movie.current.srcObject = ev.streams[0];
    }
  };

  remoteCoon.ontrack = (ev) => {
    console.log("remoteCoon.ontrack", ev);
    if (ev.streams && ev.streams[0]) {
      remote_movie.current.srcObject = ev.streams[0];
    }
  };

  /**
   * 建立p2p联系
   * @param {*} type
   */
  const getMedia = (type) => {
    if (REMOTE_MARK === type) {
      //获取远程音频流，此处注意，必须在获取音频流之后再create offer/answer 否则无法出发ontrack事件
      navigator.mediaDevices
        .getUserMedia(mediaStreamConstraints)
        .then((e) => {
          remoteStream = e;
          remoteStream.getTracks().forEach((track) => {
            remoteCoon.addTrack(track, remoteStream);
          });
          //初始化远程session
          remoteCoon
            .createAnswer(rtcOfferOptions)
            .then((event) => {
              setRemoteDesc(event);
              remoteCoon.setLocalDescription(event);
              localCoon.setRemoteDescription(event);
            })
            .catch((e) => console.log("创建远程socket对象失败", e));
        })
        .catch((error) => console.log("获取远程视屏流对象失败", error));
    } else {
      //获取本地音频流
      navigator.mediaDevices
        .getUserMedia(mediaStreamConstraints)
        .then((e) => {
          console.log("mediaStream", e);
          localStream = e;
          localStream.getTracks().forEach((track) => {
            localCoon.addTrack(track, localStream);
          });
          //初始化本地session
          localCoon
            .createOffer(rtcOfferOptions)
            .then((event) => {
              setLocalDesc(event);
              localCoon.setLocalDescription(event);
              remoteCoon.setRemoteDescription(event);
            })
            .catch((err) => {
              console.log("创建本地socket对象失败", err);
            });
        })
        .catch((error) => console.log("获取本地视屏流对象失败", error));
    }
  };

  /**
   * 关闭浏览器设备流
   * @param {*} type
   */
  const closeMedia = (type) => {
    if (type === LOCAL_MARK) {
      if (localStream) {
        console.log("localStream", localStream);
        localStream.getTracks().forEach((track) => track.stop());
      }
    } else {
      if (remoteStream) {
        console.log("remoteStream", remoteStream);
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  //创建新的聊天房间
  const createRoom = () => {
    if (Utils.isEmpty(userName)) {
      message.warn("userName 不允许为空", 2);
      return;
    }
    var localCoon = new RTCPeerConnection();
    localCoon
      .createOffer(rtcOfferOptions)
      .then((event) => {
        console.log(event);
        let userInfo = {
          uid: userName,
          sdp: event.sdp,
        };
        //初始化socket服务
        initSocket();
        //链接成功后，发送当前用户信息至服务器端
        socket.emit("create", JSON.stringify(userInfo));
      })
      .catch((err) => {
        console.log("创建本地offer失败", err);
      });
  };

  //初始化socket链接
  const initSocket = () => {
    socket = getSocket(userName);

    console.log(socket);

    socket.on("disconnect", (e) => {
      console.log("socket disconnect,please try open again", e);
    });

    socket.on("created", (e) => {
      console.log("room created", e);
      setCreatedRoom(e);
    });

    socket.on("connect", () => {
      console.log("Connected to WS server");
    });
  };

  //添加房间
  const joinRoom = () => {
    let JoinRoom = {
      rid: "",
      user: {
        uid: "",
        sdp: "",
      },
    };
    socket.emit("join", JoinRoom);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            paddingTop: 20,
            flexDirection: "column",
            alignItems: "start",
          }}
        >
          <Space>
            <div> 用户名称：</div>
            <Input
              placeholder="请输入当前用户名称"
              readOnly={true}
              value={userName}
            />
          </Space>

          <Space>
            <div> 自己房间id：</div>
            <div style={{ color: "red", width: "100%" }}>
              {null == createdRoom.rid
                ? "暂未创建，请点击创建按钮"
                : createdRoom.rid}
            </div>
            <Button type="primary" onClick={(e) => createRoom(e)}>
              创建房间
            </Button>
          </Space>

          <Space>
            <div> 加入房间id：</div>
            <Input
              placeholder="请输入想加入的房间号"
              onChange={(e) => console.log(e, e.target.value)}
            />
            <Button type="primary">加入房间</Button>
          </Space>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <video
            ref={local_movie}
            src={require("./mov_bbb.mp4").default}
            controls
            width="400"
            height="350"
            autoPlay={true}
          ></video>
          <div style={{ display: "flex" }}>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => getMedia(LOCAL_MARK)}
            >
              本地开始录制
            </button>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => closeMedia(LOCAL_MARK)}
            >
              本地结束录制
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <video
            ref={remote_movie}
            style={{ marginLeft: 20 }}
            src={require("./mov_bbb.mp4").default}
            controls
            width="400"
            height="350"
            autoPlay={true}
          ></video>

          <div style={{ display: "flex" }}>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => getMedia(REMOTE_MARK)}
            >
              远程开始录制
            </button>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => closeMedia(REMOTE_MARK)}
            >
              远程结束录制
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
