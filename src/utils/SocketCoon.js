import io from "socket.io-client";

var socket = null;

const getSocket = (userName) => {
  console.log("socket", socket);
  if (null === socket || socket.connected === false) {
    socket = io("http://127.0.0.1:8000/", {
      query: {
        token: userName,
      },
    });
    return socket;
  } else {
    return socket;
  }
};

export { getSocket };
