import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import io from "socket.io-client";
import Image from "../assets/Chat-Icon.png";

const Backend = import.meta.env.VITE_REACT_APP_BackEnd;
// const socket = io("http://localhost:5001");
const socket = io(Backend);
function Home() {
  const [message, setMessage] = useState("");
  const [Live, setLive] = useState(false);
  const [status, setStatus] = useState("");
  const [room, setRoom] = useState("");
  const [hit, setHit] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.on("room-message", (msg) => {
      ScroleBar();
      socket.emit("revieved-message",msg.room);
      appendChild(msg.message,"inMsg");
    });
  }, []);

  useEffect(()=>{
     socket.on("message-seen",(send)=>{
      seenMessage();
  });
  },[])

  useEffect(()=>{  
    socket.on("live_update", (user)=>{
      setLive(true);
  })
},[])

  useEffect(()=>{
    socket.on("room_disconnect",(msg)=>{
      setLive(false);
    //  console.log("user is diconnected chat mode off",msg);
    })
  },[])

  useEffect(()=>{
    socket.on("room_update", (msg)=>{
      Status(msg);   
    })
  }, [])

  function Status(msg){
    setStatus(msg.message);
    const status_Color = document.getElementById("Status");
    if(msg.status)   status_Color.style.color = "green";
    else  status_Color.style.color = "red";
  }

  function seenMessage(){
    let Msg_Box = document.getElementById("Msg-Box");
    let span = document.createElement("span");
    span.innerText = "seen";
    span.classList.add("seen-Message");
    Msg_Box.appendChild(span);
  }
  
 
  function appendChild(msg,type){
    event.preventDefault();
    let Msg_Box = document.getElementById("Msg-Box");
    let outMsg = document.createElement("p");
    outMsg.classList.add("message");
    outMsg.classList.add(type);
    outMsg.innerText = msg;
    Msg_Box.appendChild(outMsg);
  }

  function focusOnInput(){
      inputRef.current?.focus();
  }


  function sendMessage() {
    event.preventDefault();
    focusOnInput();
    ScroleBar();
    appendChild(message,"outMsg");
    socket.emit("message", {room, message});
    setMessage("");
  //  seenMessage();
  }

  function joinRoom(){
    event.preventDefault();
    setHit(true);
     socket.emit("Join-Room",room);
  }

  function ScroleBar(){
    const chat_Box = document.getElementById("chat-Box");
    chat_Box.scrollTop = chat_Box.scrollHeight;
  }

  return (
    <>
      <div id="Parent-Div">
        <div id="Header">Chat App</div>
        <div id="Icon"><img src={Image} alt="Image-Icon" /></div>
      <div id="Room">
            <div id="Live">{(Live)?"Live":""}</div>
            <form onSubmit={joinRoom}>
            <input type="text" minLength="1" required  onChange={(e)=>setRoom(e.target.value)} placeholder="Set a room ..."/>
            <button type="submit" disabled={hit}>Set Room</button>
            </form>
        </div>
        <div id="Status">{status}</div>
      <div id="chat-Box">
        <div id="Msg-Box">
        </div>

      </div>
      <div id="input-Box">
          <form onSubmit={sendMessage}>
            <input ref={inputRef} type="text" value={message} minLength="1" required onChange={(e) => {setMessage(e.target.value)}}  placeholder="send message ..."/>
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default memo(Home);
