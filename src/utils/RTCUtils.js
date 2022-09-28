const RTCOfferOptions = {
  iceRestart: false,
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

var configuration={
  "iceServers": [{
    "url": "turn:110.42.129.134:3478",
    "username": "dgh",//可选
    "credential": "123456"//可选
 }],
}

// 获取RTCPeerConnection 对象
const getRTCPeerConnection = () => {
  return new RTCPeerConnection(configuration);
};

// 创建rtc offer
const createOffer = (
  conn,
  createOfferSuccessCallback,
  createOfferFailCallback
) => {
  conn
    .createOffer(RTCOfferOptions)
    .then((event) => {
      console.log("sdp", event);
      return event;
    })
    .then((event) => {
      createOfferSuccessCallback({
        sdp: event.sdp,
        type: event.type,
      });
    })
    .catch((err) => {
      createOfferFailCallback(err);
    });
};

//rtc answer
const createAnswer = (
  conn,
  createAnswerSuccessCallback,
  createAnswerFailCallback
) => {
  conn
    .createAnswer(RTCOfferOptions)
    .then((event) => {
      console.log("sdp", event);
      return event;
    })
    .then((event) => {
      createAnswerSuccessCallback({
        sdp: event.sdp,
        type: event.type,
      });
    })
    .catch((err) => {
      createAnswerFailCallback(err);
    });
};

//获取设备流
const getMediaStream = (option, successCallback, failCallback) => {
  navigator.mediaDevices
    .getUserMedia(option)
    .then((e) => {
      console.log(e);
      return e;
    })
    .then((e) => {
      successCallback(e);
    })
    .catch((error) => failCallback(error));
};

export {
  getRTCPeerConnection,
  RTCOfferOptions,
  createOffer,
  createAnswer,
  getMediaStream,
};
