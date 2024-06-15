import React, { useState } from 'react';
import Game from './Game';
import socket from '../socket';

const Room = () => {
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState('');

    const joinRoom = () => {
        if (!roomId.trim()) {
            setError('Room ID cannot be empty');
            return;
        }

        socket.emit('joinRoom', roomId);
        setJoined(true);
    };

    return (
        <div>
            {joined ? (
                <Game roomId={roomId} />
            ) : (
                <div className="room-join">
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button onClick={joinRoom}>Join Room</button>
                    {error && <div className="error">{error}</div>}
                </div>
            )}
        </div>
    );
};

export default Room;