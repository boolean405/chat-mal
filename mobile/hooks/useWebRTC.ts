import { useRef } from "react";
import { RTCPeerConnection, mediaDevices } from "react-native-webrtc";
import { Socket } from "socket.io-client";

export function useWebRTC(
  socket: Socket,
  localUserId: string,
  remoteUserId: string
) {
  const pc = useRef<RTCPeerConnection | null>(null);

  const setupPeerConnection = async () => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    pc.current = new RTCPeerConnection(configuration);
    stream.getTracks().forEach((track) => pc.current?.addTrack(track, stream));

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event) => {
      // Remote stream is in event.streams[0]
    };

    return stream;
  };

  const createOffer = async () => {
    const offer = await pc.current?.createOffer();
    if (offer) {
      await pc.current.setLocalDescription(offer);
      socket.emit("webrtc-offer", { to: remoteUserId, offer });
    }
  };

  const handleOffer = async (offer) => {
    await pc.current?.setRemoteDescription(offer);
    const answer = await pc.current?.createAnswer();
    await pc.current?.setLocalDescription(answer);
    socket.emit("webrtc-answer", { to: remoteUserId, answer });
  };

  const handleAnswer = async (answer) => {
    await pc.current?.setRemoteDescription(answer);
  };

  const handleCandidate = async (candidate) => {
    await pc.current?.addIceCandidate(candidate);
  };

  const endCall = () => {
    pc.current?.close();
    pc.current = null;
  };

  return {
    setupPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleCandidate,
    endCall,
  };
}
