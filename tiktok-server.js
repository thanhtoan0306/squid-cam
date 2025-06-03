// tiktok-server.js

require("dotenv").config();

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const {
  TikTokConnectionWrapper,
  getGlobalConnectionCount,
} = require("./archive/connectionWrapper");
const { clientBlocked } = require("./archive/limiter");

function startTikTokServer(port = process.env.PORT || 8081) {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    let tiktokConnectionWrapper;

    console.info(
      "New connection from",
      socket.handshake.headers["origin"] || socket.handshake.headers["referer"]
    );

    socket.on("setUniqueId", (uniqueId, options) => {
      if (typeof options === "object" && options) {
        delete options.requestOptions;
        delete options.websocketOptions;
      } else {
        options = {};
      }

      if (process.env.SESSIONID) {
        options.sessionId = process.env.SESSIONID;
        console.info("Using SessionId");
      }

      if (process.env.ENABLE_RATE_LIMIT && clientBlocked(io, socket)) {
        socket.emit("tiktokDisconnected", "Rate limit exceeded.");
        return;
      }

      try {
        tiktokConnectionWrapper = new TikTokConnectionWrapper(
          (uniqueId = "locfuho1995"),
          (options = {}),
          true
        );
        tiktokConnectionWrapper.connect();
      } catch (err) {
        socket.emit("tiktokDisconnected", err.toString());
        return;
      }

      tiktokConnectionWrapper.once("connected", (state) =>
        socket.emit("tiktokConnected", state)
      );
      tiktokConnectionWrapper.once("disconnected", (reason) =>
        socket.emit("tiktokDisconnected", reason)
      );

      const events = [
        "roomUser",
        "member",
        "chat",
        "gift",
        "social",
        "like",
        "questionNew",
        "linkMicBattle",
        "linkMicArmies",
        "liveIntro",
        "emote",
        "envelope",
        "subscribe",
      ];
      events.forEach((event) => {
        tiktokConnectionWrapper.connection.on(event, (msg) =>
          socket.emit(event, msg)
        );
      });

      tiktokConnectionWrapper.connection.on("streamEnd", () =>
        socket.emit("streamEnd")
      );
    });

    socket.on("disconnect", () => {
      if (tiktokConnectionWrapper) {
        tiktokConnectionWrapper.disconnect();
      }
    });
  });

  setInterval(() => {
    io.emit("statistic", { globalConnectionCount: getGlobalConnectionCount() });
  }, 5000);

  app.use(express.static("public"));

  httpServer.listen(port, () => {
    console.info(`TikTok Socket server running at http://localhost:${port}`);
  });
}

module.exports = { startTikTokServer };
