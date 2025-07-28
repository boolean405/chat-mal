// import { useRef } from "react";
// import {
//   RTCPeerConnection,
//   RTCSessionDescription,
//   RTCIceCandidate,
//   mediaDevices,
// } from "react-native-webrtc";

// export default function useWebRTCCall(socket, chatId, isInitiator) {
//   const pc = useRef(null);

//   // Start local stream
//   const startLocalStream = async () => {
//     try {
//       const stream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       console.log("✅ Got user media", stream.toURL());
//       return stream;
//     } catch (err) {
//       console.error("❌ Failed to get user media", err);
//     }
//   };

//   // Initialize PeerConnection
//   const createPeerConnection = (onTrack, onIceCandidate) => {
//     const peer = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });
//     peer.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("webrtc-ice-candidate", {
//           chatId,
//           candidate: event.candidate,
//         });
//         if (onIceCandidate) onIceCandidate(event.candidate);
//       }
//     };
//     peer.ontrack = onTrack;
//     pc.current = peer;
//     return peer;
//   };

//   // Initiator: create offer and send
//   const makeOffer = async (stream) => {
//     if (!pc.current) return;
//     stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
//     const offer = await pc.current.createOffer();
//     await pc.current.setLocalDescription(offer);
//     socket.emit("webrtc-offer", { chatId, offer });
//   };

//   // Callee: receive offer, create answer
//   const handleOffer = async (offer, stream) => {
//     if (!pc.current) return;
//     stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
//     await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await pc.current.createAnswer();
//     await pc.current.setLocalDescription(answer);
//     socket.emit("webrtc-answer", { chatId, answer });
//   };

//   // Both: handle answer
//   const handleAnswer = async (answer) => {
//     if (!pc.current) return;
//     await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
//   };

//   // Both: handle ICE
//   const handleICECandidate = async (candidate) => {
//     if (candidate && pc.current) {
//       try {
//         await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (err) {}
//     }
//   };

//   // Optional: cleanup
//   const close = () => {
//     if (pc.current) {
//       pc.current.getSenders().forEach((s) => s.track && s.track.stop());
//       pc.current.close();
//       pc.current = null;
//     }
//   };

//   return {
//     startLocalStream,
//     createPeerConnection,
//     makeOffer,
//     handleOffer,
//     handleAnswer,
//     handleICECandidate,
//     close,
//   };
// }
