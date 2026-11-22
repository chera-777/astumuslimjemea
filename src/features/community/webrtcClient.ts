import { buildIceServers, detectActiveSpeakerId } from "./callLogic";

export type FacingMode = "user" | "environment";
export type PeerConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting";

export interface WebRTCSignalSender {
  sendOffer: (targetUserId: string, sdp: RTCSessionDescriptionInit) => void;
  sendAnswer: (targetUserId: string, sdp: RTCSessionDescriptionInit) => void;
  sendIceCandidate: (targetUserId: string, candidate: RTCIceCandidateInit) => void;
}

export interface WebRTCManagerCallbacks {
  onLocalStream?: (stream: MediaStream | null) => void;
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved?: (peerId: string) => void;
  onConnectionStatus?: (status: PeerConnectionStatus) => void;
  onActiveSpeaker?: (speakerId: string | null) => void;
  onError?: (message: string) => void;
}

export class WebRTCManager {
  private peers = new Map<string, RTCPeerConnection>();
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  private remoteStreams = new Map<string, MediaStream>();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private cameraTrackBeforeShare: MediaStreamTrack | null = null;
  private facingMode: FacingMode = "user";
  private sender: WebRTCSignalSender | null = null;
  private callbacks: WebRTCManagerCallbacks = {};
  private audioCtx: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private remoteAnalysers = new Map<string, AnalyserNode>();
  private speakerTimer: ReturnType<typeof setInterval> | null = null;
  private mutedPeers = new Set<string>();
  private selfUserId = "local";
  private currentSpeakerId: string | null = null;

  constructor(callbacks?: WebRTCManagerCallbacks) {
    if (callbacks) this.callbacks = callbacks;
  }

  setCallbacks(callbacks: WebRTCManagerCallbacks) {
    this.callbacks = callbacks;
  }

  setSelfUserId(userId: string) {
    this.selfUserId = userId;
  }

  setSignalSender(sender: WebRTCSignalSender | null) {
    this.sender = sender;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getFacingMode(): FacingMode {
    return this.facingMode;
  }

  async acquireLocalMedia(opts: {
    audio: boolean;
    video: boolean;
    facingMode?: FacingMode;
  }): Promise<MediaStream | null> {
    if (opts.facingMode) this.facingMode = opts.facingMode;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.callbacks.onError?.("Media devices API is unavailable in this browser environment.");
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: opts.audio
          ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : false,
        video: opts.video ? { facingMode: { ideal: this.facingMode } } : false,
      });
      this.stopLocalMediaTracksOnly();
      this.localStream = stream;
      this.attachLocalTracksToExistingPeers(stream);
      this.setupLocalAudioAnalyser(stream);
      this.callbacks.onLocalStream?.(stream);
      return stream;
    } catch (err) {
      // Fallback to audio-only if video camera fails
      if (opts.video && opts.audio) {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          this.stopLocalMediaTracksOnly();
          this.localStream = audioOnly;
          this.attachLocalTracksToExistingPeers(audioOnly);
          this.setupLocalAudioAnalyser(audioOnly);
          this.callbacks.onLocalStream?.(audioOnly);
          this.callbacks.onError?.("Camera unavailable; continuing with microphone audio.");
          return audioOnly;
        } catch {
          // Handled below
        }
      }
      const message =
        err instanceof Error
          ? `Could not access microphone/camera (${err.message}). Controls remain ready.`
          : "Microphone/camera permission denied or unavailable.";
      this.callbacks.onError?.(message);
      return null;
    }
  }

  private attachLocalTracksToExistingPeers(stream: MediaStream) {
    for (const pc of this.peers.values()) {
      const senders = pc.getSenders();
      for (const track of stream.getTracks()) {
        const existing = senders.find((s) => s.track?.kind === track.kind);
        if (existing) {
          void existing.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      }
    }
  }

  setMicMuted(muted: boolean) {
    if (!this.localStream) return;
    for (const track of this.localStream.getAudioTracks()) {
      track.enabled = !muted;
    }
    if (muted) this.mutedPeers.add(this.selfUserId);
    else this.mutedPeers.delete(this.selfUserId);
  }

  async setCameraEnabled(enabled: boolean): Promise<boolean> {
    if (!this.localStream) {
      if (enabled) {
        const acquired = await this.acquireLocalMedia({ audio: true, video: true });
        return Boolean(acquired?.getVideoTracks().length);
      }
      return false;
    }
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0 && enabled) {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: this.facingMode } },
        });
        const newTrack = camStream.getVideoTracks()[0];
        if (newTrack) {
          this.localStream.addTrack(newTrack);
          this.attachLocalTracksToExistingPeers(this.localStream);
          this.callbacks.onLocalStream?.(this.localStream);
          return true;
        }
      } catch {
        this.callbacks.onError?.("No camera device available to enable video.");
        return false;
      }
    }
    for (const track of videoTracks) {
      track.enabled = enabled;
    }
    return true;
  }

  async switchCamera(): Promise<FacingMode> {
    const nextFacing: FacingMode = this.facingMode === "user" ? "environment" : "user";
    this.facingMode = nextFacing;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return nextFacing;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      const cameras = devices.filter((d) => d.kind === "videoinput");
      let constraint: MediaTrackConstraints = { facingMode: { exact: nextFacing } };
      if (cameras.length <= 1) {
        constraint = { facingMode: { ideal: nextFacing } };
      }

      const nextStream = await navigator.mediaDevices.getUserMedia({ video: constraint });
      const newTrack = nextStream.getVideoTracks()[0];
      if (!newTrack) return nextFacing;

      if (this.localStream) {
        for (const old of this.localStream.getVideoTracks()) {
          old.stop();
          this.localStream.removeTrack(old);
        }
        this.localStream.addTrack(newTrack);
      } else {
        this.localStream = nextStream;
      }

      for (const pc of this.peers.values()) {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(newTrack);
        } else {
          pc.addTrack(newTrack, this.localStream);
        }
      }

      this.callbacks.onLocalStream?.(this.localStream);
      return nextFacing;
    } catch {
      this.callbacks.onError?.("Secondary camera is not available on this device.");
      return nextFacing;
    }
  }

  async startScreenShare(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      this.callbacks.onError?.("Screen sharing is not supported in this browser.");
      return false;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) return false;

      this.screenStream = displayStream;
      this.cameraTrackBeforeShare = this.localStream?.getVideoTracks()[0] ?? null;

      screenTrack.onended = () => {
        void this.stopScreenShare();
      };

      for (const pc of this.peers.values()) {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        } else {
          pc.addTrack(screenTrack, displayStream);
        }
      }

      this.callbacks.onLocalStream?.(displayStream);
      return true;
    } catch {
      return false;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      for (const t of this.screenStream.getTracks()) t.stop();
      this.screenStream = null;
    }
    const restoreTrack =
      this.cameraTrackBeforeShare && this.cameraTrackBeforeShare.readyState === "live"
        ? this.cameraTrackBeforeShare
        : this.localStream?.getVideoTracks()[0] ?? null;

    if (restoreTrack) {
      for (const pc of this.peers.values()) {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(restoreTrack);
        }
      }
    }
    this.cameraTrackBeforeShare = null;
    this.callbacks.onLocalStream?.(this.localStream);
  }

  private getOrCreatePeer(peerId: string): RTCPeerConnection {
    const existing = this.peers.get(peerId);
    if (existing) return existing;

    const iceServers = buildIceServers({
      turnUrl: import.meta.env.VITE_TURN_URL,
      turnUsername: import.meta.env.VITE_TURN_USER,
      turnCredential: import.meta.env.VITE_TURN_CREDENTIAL,
    });

    const pc = new RTCPeerConnection({ iceServers });

    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream);
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sender?.sendIceCandidate(peerId, event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.remoteStreams.set(peerId, stream);
      this.setupRemoteAudioAnalyser(peerId, stream);
      this.callbacks.onRemoteStream?.(peerId, stream);
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "connected" || state === "completed") {
        this.callbacks.onConnectionStatus?.("connected");
      } else if (state === "disconnected" || state === "failed") {
        this.callbacks.onConnectionStatus?.("reconnecting");
        try {
          pc.restartIce();
        } catch {
          // ignore
        }
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        this.callbacks.onConnectionStatus?.("connected");
      } else if (state === "connecting") {
        this.callbacks.onConnectionStatus?.("connecting");
      } else if (state === "disconnected" || state === "failed") {
        this.callbacks.onConnectionStatus?.("reconnecting");
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  async createOfferForPeer(peerId: string): Promise<void> {
    const pc = this.getOrCreatePeer(peerId);
    this.callbacks.onConnectionStatus?.("connecting");
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    this.sender?.sendOffer(peerId, offer);
  }

  async handleRemoteOffer(peerId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.getOrCreatePeer(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    await this.flushPendingIce(peerId, pc);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.sender?.sendAnswer(peerId, answer);
  }

  async handleRemoteAnswer(peerId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    await this.flushPendingIce(peerId, pc);
  }

  async handleRemoteIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc || !pc.remoteDescription) {
      const q = this.pendingCandidates.get(peerId) ?? [];
      q.push(candidate);
      this.pendingCandidates.set(peerId, q);
      return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      // Ignore stale candidates
    }
  }

  private async flushPendingIce(peerId: string, pc: RTCPeerConnection) {
    const q = this.pendingCandidates.get(peerId);
    if (!q?.length) return;
    this.pendingCandidates.delete(peerId);
    for (const c of q) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        // Ignore stale candidates
      }
    }
  }

  async restartIce(): Promise<void> {
    this.callbacks.onConnectionStatus?.("reconnecting");
    for (const [peerId, pc] of this.peers.entries()) {
      try {
        pc.restartIce();
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        this.sender?.sendOffer(peerId, offer);
      } catch {
        // Ignore single-peer restart failure
      }
    }
  }

  removePeer(peerId: string) {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    this.pendingCandidates.delete(peerId);
    this.remoteStreams.delete(peerId);
    this.remoteAnalysers.delete(peerId);
    this.callbacks.onRemoteStreamRemoved?.(peerId);
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.audioCtx) {
      try {
        this.audioCtx = new Ctor();
      } catch {
        return null;
      }
    }
    return this.audioCtx;
  }

  private setupLocalAudioAnalyser(stream: MediaStream) {
    if (stream.getAudioTracks().length === 0) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      this.localAnalyser = analyser;
      this.ensureSpeakerPolling();
    } catch {
      // Ignore WebAudio limitation
    }
  }

  private setupRemoteAudioAnalyser(peerId: string, stream: MediaStream) {
    if (stream.getAudioTracks().length === 0) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      this.remoteAnalysers.set(peerId, analyser);
      this.ensureSpeakerPolling();
    } catch {
      // Ignore
    }
  }

  private sampleRms(analyser: AnalyserNode): number {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      const normalized = (data[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / Math.max(1, data.length));
  }

  private ensureSpeakerPolling() {
    if (this.speakerTimer) return;
    this.speakerTimer = setInterval(() => {
      const levels: Record<string, number> = {};
      if (this.localAnalyser) {
        levels[this.selfUserId] = this.sampleRms(this.localAnalyser);
      }
      for (const [peerId, analyser] of this.remoteAnalysers.entries()) {
        levels[peerId] = this.sampleRms(analyser);
      }
      const nextSpeaker = detectActiveSpeakerId(levels, this.mutedPeers, this.currentSpeakerId);
      if (nextSpeaker !== this.currentSpeakerId) {
        this.currentSpeakerId = nextSpeaker;
        this.callbacks.onActiveSpeaker?.(nextSpeaker);
      }
    }, 220);
  }

  private stopLocalMediaTracksOnly() {
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) track.stop();
      this.localStream = null;
    }
    if (this.screenStream) {
      for (const track of this.screenStream.getTracks()) track.stop();
      this.screenStream = null;
    }
    this.cameraTrackBeforeShare = null;
  }

  destroy() {
    if (this.speakerTimer) {
      clearInterval(this.speakerTimer);
      this.speakerTimer = null;
    }
    for (const pc of this.peers.values()) {
      pc.close();
    }
    this.peers.clear();
    this.pendingCandidates.clear();
    this.remoteStreams.clear();
    this.remoteAnalysers.clear();
    this.localAnalyser = null;
    this.stopLocalMediaTracksOnly();
    this.callbacks.onLocalStream?.(null);
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      void this.audioCtx.close().catch(() => {});
    }
    this.audioCtx = null;
    this.currentSpeakerId = null;
  }
}
