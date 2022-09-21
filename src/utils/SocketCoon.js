import io from "socket.io-client";

var socket = null;

const getSocket = (userName) => {
  if (null === socket || socket.connected === false) {
    socket = io("https://room.hkcn.ltd:444", {
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
