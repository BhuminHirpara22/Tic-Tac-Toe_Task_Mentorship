import React, { useState, useEffect } from 'react';
import socket from '../socket';

const Game = ({ roomId }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    useEffect(() => {
        socket.emit('joinRoom', roomId);

        socket.on('loadGame', (room) => {
            setBoard(room.board);
            setIsXNext(room.next);
        });

        socket.on('move', (data) => {
            setBoard(data.board);
            setIsXNext(data.next);
        });

        return () => {
            socket.off('loadGame');
            socket.off('move');
        };
    }, [roomId]);

    const handleClick = (index) => {
        if (board[index] || calculateWinner(board)) return;

        const newBoard = board.slice();
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);

        socket.emit('move', {
            roomId,
            board: newBoard,
            next: !isXNext,
        });
    };

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const winner = calculateWinner(board);
    const status = winner ? `Winner: ${winner}` : `Next player: ${isXNext ? 'X' : 'O'}`;

    const renderSquare = (i) => (
        <button className="square" onClick={() => handleClick(i)}>
            {board[i]}
        </button>
    );

    return (
        <div className="game">
            <div className="game-board">
                <div className="status">{status}</div>
                <div className="board-row">
                    {renderSquare(0)}
                    {renderSquare(1)}
                    {renderSquare(2)}
                </div>
                <div className="board-row">
                    {renderSquare(3)}
                    {renderSquare(4)}
                    {renderSquare(5)}
                </div>
                <div className="board-row">
                    {renderSquare(6)}
                    {renderSquare(7)}
                    {renderSquare(8)}
                </div>
            </div>
        </div>
    );
};

export default Game;