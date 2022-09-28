import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Space, message } from "antd";
import { useLocation } from "react-router-dom";
import "antd/dist/antd.css";
import Utils from "./utils/Utils";
import { getSocket } from "./utils/SocketCoon";
import {
  getRTCPeerConnection,
  createOffer,
  createAnswer,
  getMediaStream,
} from "./utils/RTCUtils";
import { useMount } from "react-use";

const mediaStreamConstraints = {
  video: true,
  audio: true,
};

var configuration={
  iceServers: [{
    url: "turn:110.42.129.134:3478?transport=udp",
    username: "dgh",
    credential: "123456",
},{
  url: "stun:110.42.129.134:3478?transport=tcp",
  username: "dgh",
  credential: "123456",
},{
  url:"stun:stun.l.google.com:19302"
}],
}

var localStream = null;

var remoteStream = null;

var localCoon = null;

var remoteCoon = null;

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
  const [joinRoomId, setJoinedRoomId] = useState({});
  const [userName, setUserName] = useState("");
  const [callName, setCallName] = useState("");
  const local_movie = useRef(null);
  const remote_movie = useRef(null);

  const location = useLocation();

  useEffect(() => {
    setUserName(location.state.username);
  }, [location]);

  useMount(() => {
    initSocket();
    localCoon = new RTCPeerConnection(configuration);
    remoteCoon = new RTCPeerConnection(configuration);
    localCoon.onicecandidate = (event) => {
      console.log("localCoon.onicecandidate", event);
      const iceCandidate = event.candidate;
      if (iceCandidate != null) {
        socket.emit(
          "iceCandidate",
          JSON.stringify({
            fromUid: userName,
            toUid: callName,
            iceCandidate: iceCandidate,
          })
        );
      }
    };
  
    localCoon.ontrack = (ev) => {
      console.log("local_movie", local_movie);
      console.log("localCoon.ontrack", ev);
      if (ev.streams && ev.streams[0]) {
        console.log("remote stream comming");
        local_movie.current.srcObject = ev.streams[0];
      }
    };
  
    remoteCoon.ontrack = (ev) => {
      console.log("remote_movie", remote_movie);
      console.log("remoteCoon.ontrack", ev);
      if (ev.streams && ev.streams[0]) {
        console.log("local stream comming");
        remote_movie.current.srcObject = ev.streams[0];
      }
    };
  });

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

  //创建offer失败回调函数
  const createOfferFailCallback = (error) => {
    console.log("创建本地offer失败", error);
    console.log("createOfferFailCallback", error);
  };

  //创建新的聊天房间
  const createRoom = () => {
    if (Utils.isEmpty(userName)) {
      message.warn("userName 不允许为空", 2);
      return;
    }
    socket.emit(
      "create",
      JSON.stringify({
        uid: userName,
        sdp: "",
        type: "",
      })
    );
  };

  //初始化socket链接
  const initSocket = () => {
    socket = getSocket(location.state.username);

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

    socket.on("errored", (e) => {
      console.log("error", e);
    });

    socket.on("joined", (e) => {
      console.log("joined", e);
    });

    socket.on("callYou", (e) => {
      console.log("callYou", e);
      handOffer(e);
    });

    socket.on("answerYou", (e) => {
      console.log("answerYou", e);
      answerYou(e);
    });

    socket.on("iceCandidate", (e) => {
      console.log("iceCandidate", e);
      receiveIceCandidate(e);
    });
  };

  //加入房间
  const joinRoom = () => {
    let JoinRoom = {
      rid: joinRoomId,
      user: {
        uid: userName,
        sdp: Math.random(),
      },
    };
    socket = getSocket(userName);
    socket.emit("join", JSON.stringify(JoinRoom));
  };

  //拨打电话
  const callSomeone = (e) => {
    console.log("callSomeone", e);
    getMediaStream(
      mediaStreamConstraints,
      (streams) => {
        streams.getTracks().forEach((track) => {
          localCoon.addTrack(track, streams);
        });
        localStream = streams;
        //初始化本地session
        createOffer(
          localCoon,
          (value) => {
            localCoon.setLocalDescription({
              sdp: value.sdp,
              type: value.type,
            });
            console.log("创建本地offer success", local_desc);
            // socket = getSocket(userName);
            socket.emit(
              "handCall",
              JSON.stringify({
                fromUid: userName,
                toUid: callName,
                offer: value.sdp,
                offerType: value.type,
              })
            );
          },
          createOfferFailCallback
        );
      },
      (error) => {
        console.log("获取本地视屏流对象失败", error);
      }
    );
  };

  //接听电话
  const answerCall = (e) => {
    console.log("answerCall", e);
  };

  //接听电话
  const receiveIceCandidate = (e) => {
    console.log("receiveIceCandidate", e);
    if (e.iceCandidate != null) {
      const newIceCandidate = new RTCIceCandidate(e.iceCandidate);
      remoteCoon
        .addIceCandidate(newIceCandidate)
        .then(() => {
          console.log("remoteCoon addIceCandidate success");
        })
        .catch((e) => {
          console.log("remoteCoon addIceCandidate error", e);
        });
    }
  };

  //拒绝接听
  const rejectCall = (e) => {
    console.log("rejectCall", e);
  };

  //对方接听回复回调
  const answerYou = (answer) => {
    console.log("answerYou", answer);
    localCoon.setRemoteDescription({
      sdp: answer.answer,
      type: answer.answerType,
    });
  };

  //处理offer
  const handOffer = (offer) => {
    getMediaStream(
      mediaStreamConstraints,
      (streams) => {
        streams.getTracks().forEach((track) => {
          remoteCoon.addTrack(track, streams);
        });
        remoteStream = streams;
        //初始化远程session
        remoteCoon.setRemoteDescription({
          sdp: offer.offer,
          type: offer.offerType,
        });
        //根据offer信息创建answer
        createAnswer(
          remoteCoon,
          (answer) => {
            console.log("answer", answer);
            //send answer to server
            remoteCoon.setLocalDescription(answer);
            //将answer信息同步给服务器
            socket.emit(
              "handAnswer",
              JSON.stringify({
                fromUid: offer.toUid,
                toUid: offer.fromUid,
                answer: answer.sdp,
                answerType: answer.type,
              })
            );
          },
          (e) => console.log("根据 offer 创建 answer 失败", e)
        );
      },
      (error) => console.log("获取远程视屏流对象失败", error)
    );
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
              onChange={(e) => {
                console.log("想要加入房间", e.target.value);
                setJoinedRoomId(e.target.value);
              }}
            />
            <Button type="primary" onClick={(e) => joinRoom(e)}>
              加入房间
            </Button>
          </Space>

          <Space>
            <div> call socketId：</div>
            <Input
              placeholder="请输入向沟通的用户名"
              onChange={(e) => {
                console.log("想要拨打电话", e.target.value);
                setCallName(e.target.value);
              }}
            />
            <Button type="primary" onClick={(e) => callSomeone(e)}>
              拨打号码
            </Button>
          </Space>

          <Space>
            <Button type="primary" onClick={(e) => answerCall(e)}>
              接听电话
            </Button>
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
            autoPlay={false}
          ></video>
          <div style={{ display: "flex" }}>
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
            autoPlay={false}
          ></video>

          <div style={{ display: "flex" }}>
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
