import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import body_parser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

const port = 3001;

app.use(body_parser.urlencoded({extended: true}));
mongoose.connect("mongodb://127.0.0.1:27017/datadb");

const dataSchema = new mongoose.Schema({
    roomId: { type: String },
    board: { type: [String], default: Array(9).fill(null) },
    next: { type: Boolean, default: true }
});

const Data = mongoose.model('Data', dataSchema);

app.use(express.static(__dirname + "public"));

app.get("*",(req,res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinRoom', async (roomId) => {
        socket.join(roomId);
        const room = await Data.findOne({ roomId: roomId });
        if (room) {
            socket.emit('loadGame', room);
        } else {
            const newRoom = new Data({ roomId: roomId, board: Array(9).fill(null), next: true });
            await newRoom.save();
            socket.emit('loadGame', newRoom);
        }
    });

    socket.on('move', async (data) => {
        const { roomId, board, next } = data;
        const room = await Data.findOne({ roomId: roomId });
        if(room){
            room.board = board;
            room.next = next;
            await room.save();
            socket.to(roomId).emit('move', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});