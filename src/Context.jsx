import {nanoid} from "nanoid"
import React, {createContext, useEffect, useRef, useState} from "react";
import Peer from "simple-peer";
import {io} from "socket.io-client";

const SocketContext = createContext();

const socket = io("/");

const ContextProvider = ({children}) => {
  const [stream, setStream] = useState(null);
  const [user, setUser] = useState("");
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState(nanoid(5));

  const videoRef = useRef();
  const userVideoRef = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    (async () => {
      navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(currentStream => {
        setStream(currentStream);
        videoRef.current.srcObject = currentStream;
      })

      socket.on("me", id => {
        setUser(id)
      })

      socket.on("callUser", ({from, name: callerName, signal}) => {
        setCall({
          isReceivedCall: true,
          name: callerName,
          from,
          signal
        })
      })
    })()
  }, [])

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })

    peer.on("signal", (data) => {
      socket.emit("answerCall", {signal: data, to: call?.from})
    })

    peer.on("stream", (currentStream) => {
      userVideoRef.current.srcObject = currentStream;
    })

    peer.signal(call.signal);

    connectionRef.current = peer;

  }

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })

    peer.on("signal", (data) => {
      socket.emit("callUser", {userToCall: id, signalData: data, from: user, name})
    })

    peer.on("stream", (currentStream) => {
      userVideoRef.current.srcObject = currentStream;
    })

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal)
    })

    connectionRef.current = peer;
  }

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();

    window.location.relad();
  }

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        videoRef,
        userVideoRef,
        stream,
        name,
        setName,
        callEnded,
        user,
        callUser,
        answerCall,
        leaveCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export {ContextProvider, SocketContext}