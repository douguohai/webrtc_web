import React from "react";
import io from "socket.io-client";

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

export default class AppRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      local_desc: {},
      remote_desc: {},
    };
    this.getMedia = this.getMedia.bind(this);
    this.closeMedia = this.closeMedia.bind(this);

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
      if (ev.streams && ev.streams[0]) {
        this.local_movie.srcObject = ev.streams[0];
      }
    };

    remoteCoon.ontrack = (ev) => {
      if (ev.streams && ev.streams[0]) {
        this.remote_movie.srcObject = ev.streams[0];
      }
    };
  }

  componentDidMount() {
    if (null === socket) {
      socket = io("http://127.0.0.1:8000/");
    }

    socket.on("reply", function (msg) {
      console.log("reply", msg);
    });

    socket.on("disconnect", (e) => {
      console.log("socket disconnect,please try open again", e);
    });

    socket.on("connect", function () {
      console.log("Connected to WS server");
      console.log(socket.connected);
    });

    setInterval(() => {
      console.log(123);
      socket.emit("notice", JSON.stringify("name:dgh"));
    }, 3000);
  }

  /**
   * 建立p2p联系
   * @param {*} type
   */
  getMedia(type) {
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
              this.setState({
                remote_desc: event,
              });
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
          localStream = e;
          localStream.getTracks().forEach((track) => {
            localCoon.addTrack(track, localStream);
          });
          //初始化本地session
          localCoon
            .createOffer(rtcOfferOptions)
            .then((event) => {
              this.setState({
                local_desc: event,
              });
              localCoon.setLocalDescription(event);
              remoteCoon.setRemoteDescription(event);
            })
            .catch((err) => {
              console.log("创建本地socket对象失败", err);
            });
        })
        .catch((error) => console.log("获取本地视屏流对象失败", error));
    }
  }

  /**
   * 关闭浏览器设备流
   * @param {*} type
   */
  closeMedia(type) {
    if (type === LOCAL_MARK) {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    } else {
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    }
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <video
            ref={(local_movie) => {
              this.local_movie = local_movie;
            }}
            src={require("./mov_bbb.mp4").default}
            controls
            width="400"
            height="350"
            autoPlay={true}
          >
            您的浏览器不支持播放该视频！
          </video>
          <div style={{ display: "flex" }}>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => this.getMedia(LOCAL_MARK)}
            >
              本地开始录制
            </button>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => this.closeMedia(LOCAL_MARK)}
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
            ref={(remote_movie) => {
              this.remote_movie = remote_movie;
            }}
            style={{ marginLeft: 20 }}
            src={require("./mov_bbb.mp4").default}
            controls
            width="400"
            height="350"
            autoPlay={true}
          >
            您的浏览器不支持播放该视频！
          </video>
          <div style={{ display: "flex" }}>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => this.getMedia(REMOTE_MARK)}
            >
              远程开始录制
            </button>
            <button
              style={{ marginTop: 20, width: 100 }}
              onClick={() => this.closeMedia(REMOTE_MARK)}
            >
              远程结束录制
            </button>
          </div>
        </div>
      </div>
    );
  }
}
