import cookieParser from "cookie-parser";
import express from "express";
// import http from "http";
import cors from "cors";

import { getEnv } from "../helpers/getEnv";
import { databaseConnection } from '../db/databaseConnection';

import { authRoutes, usersRoutes, boardRoutes, requestRoutes } from "../routes";

class Server {
  private app: express.Application;
  private port: number | string;
  // private server: http.Server;
  private paths: { [key: string]: string };

  constructor() {
    this.app = express();
    this.port = getEnv.PORT || 3000;
    // this.server = http.createServer(this.app);
    this.paths = {
      auth: '/api/auth',
      users: '/api/users',
      boards: '/api/boards',
      requests: '/api/requests',
    };
    this.initDB();
    this.middlewares();
    this.routes();
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

    this.app.use('/*', (req, res) => {
      res.status(404).json({
        ok: false,
        message: 'Route not found',
      });
    });

    // this.app.use(errorHandler as ErrorRequestHandler);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`🟢 Server is running on port ${this.port}`);
    });
  }
}

export default Server; 