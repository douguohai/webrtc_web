import React from 'react';

const mediaStreamConstraints = {
  video: true,
  audio:true
};

var localStream;

var localCoon=new RTCPeerConnection()

var remoteCoon=new RTCPeerConnection()


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rtcOfferOptions:{
        iceRestart:false,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      },
      local_desc:{},
      remote_desc:{},
      local_stream:{},
      remote_stream:{}
    };
    this.init=this.init.bind(this)
    this.getLocalMedia=this.getLocalMedia.bind(this)
    this.closeLocalMedia=this.closeLocalMedia.bind(this)
    this.handOffer=this.handOffer.bind(this)


    localCoon.onicecandidate= event =>{
      const iceCandidate=event.candidate
      console.log(iceCandidate)
      if(iceCandidate!=null){
        const newIceCandidate = new RTCIceCandidate(iceCandidate);
        remoteCoon.addIceCandidate(newIceCandidate).then(()=>{
          console.log("remoteCoon addIceCandidate success",event)
        }).catch(e=>{
          console.log("remoteCoon addIceCandidate error",e)
        })
      }
    }
    
    localCoon.ontrack= ev => {
      if (ev.streams && ev.streams[0]) {
        this.local_movie.srcObject = ev.streams[0];
      }
    }
    
    remoteCoon.ontrack= ev => {
      if (ev.streams && ev.streams[0]) {
        this.remote_movie.srcObject = ev.streams[0];
      }
    }
  }

  async init(){
    //获取本地音频流
    await navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(e=>{
      localStream=e
      localStream.getTracks().forEach((track) => {
        localCoon.addTrack(track,localStream)
      })
    }).catch(error=>console.log(error))
    
    //初始化本地session
    localCoon.createOffer(this.state.rtcOfferOptions).then((e)=>{
      this.setState({
        local_desc:e
      })
      localCoon.setLocalDescription(e)
      this.handOffer()
    }).catch((err)=>{
      console.log("创建本地socket对象失败",err)
    })
  }


   handOffer(){ 
    //获取本地音频流，此处注意，必须在获取音频流之后再create offer/answer 否则无法出发ontrack事件
    localStream.getTracks().forEach((track) => {
      remoteCoon.addTrack(track,localStream)
    })

    //初始化远程session
    remoteCoon.setRemoteDescription(this.state.local_desc)
    remoteCoon.createAnswer(this.state.rtcOfferOptions).then(event=>{
      this.setState({
        remote_desc:event
      })
      remoteCoon.setLocalDescription(event)
      localCoon.setRemoteDescription(event)
    }).catch(e=>console.log("创建远程socket对象失败",e))
  }


  //获取本季摄像机采集视屏
   getLocalMedia(){
    
  }

  //关闭本地媒体设备
  closeLocalMedia(){
    localStream.getTracks().forEach(track => track.stop())
  }

  componentDidMount(){
    this.init()
  }

  render() {
    return (
        <div style={{display:'flex',justifyContent:'center'}}>
          <div style={{display:'flex',flexDirection:"column",alignItems:'center'}}>
            <video ref={local_movie => {this.local_movie = local_movie}}  src={require('./mov_bbb.mp4').default} controls width="400" height="350" 
              autoPlay={true} >
              您的浏览器不支持播放该视频！
            </video>
            <div style={{display:'flex'}}>
                <button style={{marginTop:20,width:100}} onClick={this.getLocalMedia}>本地开始录制</button>
                <button style={{marginTop:20,width:100}} onClick={this.closeLocalMedia} >本地结束录制</button>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:"column",alignItems:'center'}}>
            <video ref={remote_movie => {this.remote_movie = remote_movie}}  style={{marginLeft:20}}  src={require('./mov_bbb.mp4').default} controls width="400" height="350" 
              autoPlay={true}>
              您的浏览器不支持播放该视频！
            </video>
            <div style={{display:'flex'}}>
              <button style={{marginTop:20,width:100}} onClick={this.getLocalMedia} >远程开始录制</button>
              <button style={{marginTop:20,width:100}} onClick={this.closeLocalMedia} >远程结束录制</button>
            </div>
          </div>
        </div>
    );
  }
}
