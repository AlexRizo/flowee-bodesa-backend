import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

import { getEnv } from "../helpers/getEnv";
import { databaseConnection } from '../db/databaseConnection';

import { authRoutes, usersRoutes, boardRoutes, requestRoutes, formatRoutes } from "../routes";
import { socketController } from "../sockets/socketController";

class Server {
  private app: express.Application;
  private port: number | string;
  private server: http.Server;
  private io: SocketIOServer;
  private paths: { [key: string]: string };

  constructor() {
    this.app = express();
    this.port = getEnv.PORT || 3000;
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: 'http://localhost:5173',
        credentials: true,
      },
    });
    this.paths = {
      auth: '/api/auth',
      users: '/api/users',
      boards: '/api/boards',
      requests: '/api/requests',
      formats: '/api/formats',
    };
    this.initDB();
    this.middlewares();
    this.routes();
    this.socket();
  }

  private initDB() {
    databaseConnection();
  }

  private middlewares() {
    this.app.use(express.json());
    this.app.use(express.static('public'));
    this.app.use(cookieParser());
    this.app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }));
  }

  private routes() {
    this.app.use(this.paths.auth, authRoutes);
    this.app.use(this.paths.users, usersRoutes);
    this.app.use(this.paths.boards, boardRoutes);
    this.app.use(this.paths.requests, requestRoutes);
    this.app.use(this.paths.formats, formatRoutes);

    this.app.use('/*', (req, res) => {
      res.status(404).json({
        ok: false,
        message: 'Route not found',
      });
    });
  }

  private socket() {
    this.io.on('connection', (socket) => socketController(socket, this.io));
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`🟢 Server is running on port ${this.port}`);
    });
  }
}

export default Server; 