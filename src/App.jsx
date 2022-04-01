import {CssBaseline} from "@mui/material";
import React, {useContext, useState} from "react";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {SocketContext} from "./Context";

function VideoPlayer() {
  const context = useContext(SocketContext);

  return (
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
      {context.stream && (
        <video playsInline muted ref={context.videoRef} autoPlay style={{width: 450, pointerEvents: "none", transform: "rotateY(180deg)"}} />
      )}

      {context.callAccepted && !context.callEnded && (
        <video playsInline ref={context.userVideoRef} autoPlay style={{width: 450, pointerEvents: "none"}} />
      )}

    </div>
  );
}

function Notifications() {
  const context = useContext(SocketContext);

  return (
    <div>
      <h4>Notifications:</h4>
      {context.call?.isReceivedCall && !context.callAccepted && (
        <>
          <h5>{context.call.name} is calling</h5>
          <button onClick={context.answerCall}>Answer the call</button>
        </>
      )}
    </div>
  );
}

function Options({children}) {
  const context = useContext(SocketContext);
  const [idToCall, setIdToCall] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{width: 500, border: "1px solid", padding: "20px", height: "200px"}}>
          <h6>Call ID</h6>
          <input type="text" value={context.user} disabled style={{minWidth: "200px"}} />

          <CopyToClipboard
            text={context.user} onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          }}
          >
            <button>Copy</button>
          </CopyToClipboard>
          <div>{copied ? "Copied" : ""}</div>
        </div>

        <div style={{width: 500, border: "1px solid", padding: "20px", height: "200px"}}>
          <h6>Make Call</h6>
          <input type="text" value={idToCall} onChange={e => setIdToCall(e.target.value)} />
          {context.callAccepted && !context.callEnded ? (
            <button onClick={context.leaveCall}>hang up</button>
          ) : (
            <button
              onClick={() => {
                context.callUser(idToCall)
              }}
            >call</button>
          )}
        </div>
      </div>

      <div style={{width: "100%", border: "1px solid", padding: "20px", marginTop: "10px"}}>
        {children}
      </div>

    </>
  );
}

export default function RTC() {
  return (
    <div style={{padding: "20px"}}>
      <CssBaseline />
      <VideoPlayer />

      <Options>
        <Notifications />
      </Options>

    </div>
  );
}
