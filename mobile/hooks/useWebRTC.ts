import { useEffect, useRef, useState } from "react";
import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";
import { socket } from "@/config/socket"; // Adjust path if needed

type UseWebRTCHook = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCalling: boolean;
  startCall: () => Promise<void>;
  endCall: () => void;
};

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function useWebRTC(chatId: string | undefined): UseWebRTCHook {
  const pc = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const startCall = async () => {
    if (!chatId) return;
    setIsCalling(true);

    pc.current = new RTCPeerConnection(configuration);

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setLocalStream(stream);

    stream.getTracks().forEach((track) => {
      pc.current?.addTrack(track, stream);
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, chatId });
      }
    };

    pc.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.emit("call-chat", { chatId, offer });
  };

  const endCall = () => {
    pc.current?.close();
    pc.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
  };

  useEffect(() => {
    if (!chatId) return;

    const handleCallChat = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      if (!pc.current) {
        pc.current = new RTCPeerConnection(configuration);

        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);

        stream.getTracks().forEach((track) => {
          pc.current?.addTrack(track, stream);
        });

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { candidate: event.candidate, chatId });
          }
        };

        pc.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };
      }

      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("call-chat-answer", { chatId, answer });
      setIsCalling(true);
    };

    const handleCallChatAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (pc.current) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidate }) => {
      if (pc.current && candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    };

    socket.on("call-chat", handleCallChat);
    socket.on("call-chat-answer", handleCallChatAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("call-chat", handleCallChat);
      socket.off("call-chat-answer", handleCallChatAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      endCall();
    };
  }, [chatId]);

  return { localStream, remoteStream, isCalling, startCall, endCall };
}
