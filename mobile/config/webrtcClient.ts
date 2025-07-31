import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";
import { socket } from "@/config/socket";

export type WebRTCOpts = {
  chatId: string;
  isVideo: boolean;
  isAudio: boolean;
  facingMode?: "user" | "environment";
  iceServers?: RTCIceServer[];
  onLocalStream?: (stream: MediaStream | null) => void;
  onRemoteStream?: (stream: MediaStream | null) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (e: Error) => void;
};

const DEFAULT_ICE: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  // TODO: add TURN for production:
  // { urls: 'turn:your.turn.host:3478', username: 'user', credential: 'pass' }
];

export class WebRTCClient {
  private pc?: RTCPeerConnection;
  private localStream?: MediaStream;
  private remoteStream?: MediaStream;
  private opts!: WebRTCOpts;
  private isCaller = false;

  init(opts: WebRTCOpts) {
    this.opts = {
      ...opts,
      iceServers: opts.iceServers?.length ? opts.iceServers : DEFAULT_ICE,
    };

    this.registerSocketHandlers();
  }

  private registerSocketHandlers() {
    socket.off("webrtc-offer");
    socket.off("webrtc-answer");
    socket.off("webrtc-ice-candidate");

    socket.on("webrtc-offer", async ({ chatId, sdp }) => {
      if (chatId !== this.opts.chatId) return;
      try {
        await this.ensurePeer();
        await this.pc!.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);
        socket.emit("webrtc-answer", { chatId: this.opts.chatId, sdp: answer });
      } catch (e: any) {
        this.opts.onError?.(e);
      }
    });

    socket.on("webrtc-answer", async ({ chatId, sdp }) => {
      if (chatId !== this.opts.chatId) return;
      if (!this.isCaller) return;
      try {
        await this.pc?.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (e: any) {
        this.opts.onError?.(e);
      }
    });

    socket.on("webrtc-ice-candidate", async ({ chatId, candidate }) => {
      if (chatId !== this.opts.chatId) return;
      try {
        if (candidate) {
          const ice = new RTCIceCandidate(candidate);
          await this.pc?.addIceCandidate(ice);
        }
      } catch (e: any) {
        // Some platforms throw if remoteDescription not set yet—can queue if needed
        console.log(e.message);
      }
    });
  }

  /** Create peer and local stream (called by caller/answerer) */
  private async ensurePeer() {
    if (this.pc) return;

    const pc: any = new RTCPeerConnection({ iceServers: this.opts.iceServers });
    this.pc = pc; // assign once

    pc.onicecandidate = ({ candidate }: RTCPeerConnectionIceEvent) => {
      if (candidate) {
        socket.emit("webrtc-ice-candidate", {
          chatId: this.opts.chatId,
          candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      // Use the captured pc, not this.pc (which may be cleared in destroy()).
      const state =
        (pc as any).connectionState ?? (pc as any).iceConnectionState; // fallback for older RN builds
      if (!state) return;

      this.opts.onConnectionStateChange?.(state);

      if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        // optional: auto cleanup
      }
    };

    pc.ontrack = (event: any) => {
      const [stream] = event.streams;
      if (stream) {
        this.remoteStream = stream;
        this.opts.onRemoteStream?.(stream);
      }
    };

    // Local media
    await this.createOrUpdateLocalStream(
      this.opts.isVideo,
      this.opts.isAudio,
      this.opts.facingMode
    );
    if (this.localStream) {
      this.localStream
        .getTracks()
        .forEach((t) => pc.addTrack(t, this.localStream!));
    }
  }

  private async createOrUpdateLocalStream(
    useVideo: boolean,
    useAudio: boolean,
    facingMode: "user" | "environment" = "user"
  ) {
    // stop old stream
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = undefined;

    const constraints: any = {
      audio: useAudio,
      video: useVideo
        ? {
            facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30, max: 120 },
          }
        : false,
    };

    if (useVideo || useAudio) {
      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.opts.onLocalStream?.(stream);
    } else {
      this.opts.onLocalStream?.(null);
    }
  }

  /** Caller starts the call: create offer -> send */
  async startAsCaller() {
    this.isCaller = true;
    await this.ensurePeer();
    const offer = await this.pc!.createOffer({});
    await this.pc!.setLocalDescription(offer);
    socket.emit("webrtc-offer", { chatId: this.opts.chatId, sdp: offer });
  }

  /** Callee confirms ready to answer; ensurePeer() is called via offer handler */
  async startAsCallee() {
    this.isCaller = false;
    await this.ensurePeer(); // ensures we have local stream ready when offer arrives
  }

  async toggleVideo(enabled: boolean) {
    this.opts.isVideo = enabled;
    if (!this.localStream)
      return this.createOrUpdateLocalStream(
        enabled,
        this.opts.isAudio,
        this.opts.facingMode
      );
    this.localStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
    if (!enabled) {
      // optionally replace sender track with null or keep it disabled
    } else if (enabled && this.localStream.getVideoTracks().length === 0) {
      await this.createOrUpdateLocalStream(
        true,
        this.opts.isAudio,
        this.opts.facingMode
      );
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.pc
        ?.getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender && videoTrack) await sender.replaceTrack(videoTrack);
    }
  }

  async toggleAudio(enabled: boolean) {
    this.opts.isAudio = enabled;
    console.log("toggleAudio", { enabled, isAudio: this.opts.isAudio });

    if (!this.localStream) {
      // If no stream exists, create a new one with the updated audio state
      await this.createOrUpdateLocalStream(
        this.opts.isVideo,
        enabled,
        this.opts.facingMode
      );
      // Add new tracks to the peer connection

      if (this.localStream && this.pc) {
        this.localStream.getTracks().forEach((track: any) => {
          if (track.kind === "audio") {
            const sender = this.pc
              ?.getSenders()
              .find((s) => s.track?.kind === "audio");
            if (sender) {
              sender.replaceTrack(track);
            } else {
              this.pc.addTrack(track, this.localStream);
            }
          }
        });
      }
      return;
    }

    // If stream exists, toggle the audio track
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      if (!enabled) {
        // Mute: disable or stop the audio track
        audioTrack.enabled = false;
        // Optionally stop the track to ensure no audio is sent
        // audioTrack.stop();
      } else {
        // Unmute: ensure the track is enabled or replace it with a new one
        if (!audioTrack.enabled) {
          audioTrack.enabled = true;
        } else {
          // If the track was stopped, recreate the stream
          await this.createOrUpdateLocalStream(
            this.opts.isVideo,
            enabled,
            this.opts.facingMode
          );
          const newAudioTrack = this.localStream.getAudioTracks()[0];
          const sender = this.pc
            ?.getSenders()
            .find((s) => s.track?.kind === "audio");
          if (sender && newAudioTrack) {
            await sender.replaceTrack(newAudioTrack);
          }
        }
      }
    } else if (enabled) {
      // No audio track but audio is requested, recreate the stream
      await this.createOrUpdateLocalStream(
        this.opts.isVideo,
        enabled,
        this.opts.facingMode
      );
      const newAudioTrack = this.localStream.getAudioTracks()[0];
      const sender = this.pc
        ?.getSenders()
        .find((s) => s.track?.kind === "audio");
      if (sender && newAudioTrack) {
        await sender.replaceTrack(newAudioTrack);
      } else if (newAudioTrack) {
        this.pc?.addTrack(newAudioTrack, this.localStream);
      }
    }
  }

  /** Switch front/back camera without recreating the stream */
  /** Switch front/back camera by recreating video and reattaching tracks */
  private async _recreateTracksForNewFacing() {
    const oldStream = this.localStream;

    // 1) Create a NEW stream first (so we don't go silent in between)
    const newStream = await mediaDevices.getUserMedia({
      audio: this.opts.isAudio, // keep audio in the new stream
      video: {
        facingMode: this.opts.facingMode, // already toggled by caller
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 },
      },
    });

    // 2) Replace senders
    const newVideo = newStream.getVideoTracks()[0];
    const newAudio = newStream.getAudioTracks()[0];

    const videoSender = this.pc
      ?.getSenders()
      .find((s) => s.track?.kind === "video");
    const audioSender = this.pc
      ?.getSenders()
      .find((s) => s.track?.kind === "audio");

    if (videoSender && newVideo) await videoSender.replaceTrack(newVideo);
    if (audioSender && newAudio) await audioSender.replaceTrack(newAudio);

    // 3) Update localStream reference and callback
    this.localStream = newStream;
    this.opts.onLocalStream?.(newStream);

    // 4) Stop old tracks LAST
    oldStream?.getTracks().forEach((t) => t.stop());
  }

  /** Public API */
  async switchCamera() {
    // Toggle desired facing for next capture
    this.opts.facingMode =
      this.opts.facingMode === "user" ? "environment" : "user";

    if (!this.opts.isVideo) return;

    // Prefer A if available:
    const t: any = this.localStream?.getVideoTracks()[0];
    if (t && typeof t._switchCamera === "function") {
      t._switchCamera();
    } else {
      await this._recreateTracksForNewFacing(); // Fallback B
    }
  }

  getLocalStream() {
    return this.localStream || null;
  }
  getRemoteStream() {
    return this.remoteStream || null;
  }

  /** Cleanup on hangup */
  destroy() {
    // Stop local media
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = undefined;
    this.remoteStream = undefined;

    const pc: any = this.pc;
    this.pc = undefined; // clear first so late events don't read a half-torn object

    if (pc) {
      try {
        pc.onconnectionstatechange = null as any;
      } catch {}
      try {
        pc.onicecandidate = null as any;
      } catch {}
      try {
        pc.ontrack = null as any;
      } catch {}
      try {
        pc.getSenders().forEach((s: any) => {
          try {
            s.replaceTrack(null as any);
          } catch {}
        });
      } catch {}
      try {
        pc.close();
      } catch {}
    }

    // If you spin clients up/down dynamically, also remove socket listeners:
    // socket.off("webrtc-offer");
    // socket.off("webrtc-answer");
    // socket.off("webrtc-ice-candidate");
  }
}

// singleton if you want only one active call at a time
export const webrtcClient = new WebRTCClient();
