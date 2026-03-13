'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/index';
import { getSocket } from '../../../lib/socket';
import { Phone, Video, Mic, MicOff, VideoIcon, VideoOff, PhoneOff, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CallsPage() {
  const searchParams = useSearchParams();
  const channelId = searchParams.get('channel');
  const callType = searchParams.get('type') || 'video';
  const { user } = useAuthStore();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('call-incoming', (data) => setIncomingCall(data));
    socket.on('call-answered', async ({ from, answer }) => {
      const pc = peerConnections.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on('ice-candidate', async ({ from, candidate }) => {
      const pc = peerConnections.current[from];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on('call-ended', ({ from }) => {
      endCallWithPeer(from);
      toast('Call ended by the other user');
    });

    return () => {
      socket.off('call-incoming');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, []);

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: !isVideoOff,
      audio: true,
    });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const startCall = async (toUserId) => {
    try {
      const stream = await getMedia();
      const socket = getSocket();
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current[toUserId] = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => setRemoteStreams((prev) => ({ ...prev, [toUserId]: e.streams[0] }));
      pc.onicecandidate = (e) => { if (e.candidate && socket) socket.emit('ice-candidate', { to: toUserId, candidate: e.candidate }); };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call-offer', { to: toUserId, channelId, offer, type: callType });
      setInCall(true);
      toast.success('Calling…');
    } catch (err) { toast.error('Could not access camera/microphone'); }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    const stream = await getMedia();
    const socket = getSocket();
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[incomingCall.from] = pc;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = (e) => setRemoteStreams((prev) => ({ ...prev, [incomingCall.from]: e.streams[0] }));
    pc.onicecandidate = (e) => { if (e.candidate && socket) socket.emit('ice-candidate', { to: incomingCall.from, candidate: e.candidate }); };

    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('call-answer', { to: incomingCall.from, answer });
    setInCall(true);
    setIncomingCall(null);
  };

  const endCallWithPeer = (peerId) => {
    const pc = peerConnections.current[peerId];
    if (pc) { pc.close(); delete peerConnections.current[peerId]; }
    setRemoteStreams((prev) => { const n = { ...prev }; delete n[peerId]; return n; });
  };

  const hangUp = () => {
    const socket = getSocket();
    Object.keys(peerConnections.current).forEach((peerId) => {
      if (socket) socket.emit('call-end', { to: peerId });
      endCallWithPeer(peerId);
    });
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setInCall(false);
  };

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsVideoOff(!isVideoOff);
  };

  const remoteStreamEntries = Object.entries(remoteStreams);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      <div className="topbar">
        <Phone size={18} style={{ color: 'var(--accent)' }} /> <span className="topbar-title">Voice & Video Calls</span>
      </div>

      {/* Incoming call banner */}
      {incomingCall && !inCall && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 16, padding: '16px 20px', zIndex: 200, boxShadow: 'var(--shadow-lg)', minWidth: 280 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>📞 Incoming {incomingCall.type} call</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>{incomingCall.fromName} is calling…</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, gap: 6 }} onClick={answerCall}><Phone size={14} /> Answer</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setIncomingCall(null)}>Decline</button>
          </div>
        </div>
      )}

      {/* Video grid */}
      <div className="video-grid" style={{ gridTemplateColumns: remoteStreamEntries.length > 0 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', flex: 1 }}>
        {/* Local video */}
        <div className="video-tile" style={{ minHeight: 240 }}>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          <div className="video-tile-name">You {isMuted ? '🔇' : ''}</div>
          {(isVideoOff || !localStream) && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)' }}>
              <div className="avatar avatar-xl">{user?.username?.[0]?.toUpperCase()}</div>
            </div>
          )}
        </div>

        {/* Remote videos */}
        {remoteStreamEntries.map(([peerId, stream]) => (
          <RemoteVideo key={peerId} stream={stream} peerId={peerId} />
        ))}

        {/* Placeholder if no call */}
        {!inCall && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 64 }}>📞</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Start a Call</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Invite a member below to start a voice or video call</p>
            <button className="btn btn-primary btn-lg" onClick={() => { toast('In the sidebar, open a DM and click the call button'); }}>
              <Video size={18} /> Start New Call
            </button>
          </div>
        )}
      </div>

      {/* Call controls */}
      {inCall && (
        <div className="call-controls">
          <button className={`btn call-btn ${isMuted ? 'call-btn-muted' : 'call-btn-active'}`} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          {callType === 'video' && (
            <button className={`btn call-btn ${isVideoOff ? 'call-btn-muted' : 'call-btn-active'}`} onClick={toggleVideo} title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}>
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}
          <button className="btn call-btn call-btn-end" onClick={hangUp} title="End call">
            <PhoneOff size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

function RemoteVideo({ stream, peerId }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return (
    <div className="video-tile" style={{ minHeight: 240 }}>
      <video ref={ref} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div className="video-tile-name">Remote user</div>
    </div>
  );
}
