const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { startTikTokServer } = require("./tiktok-server");
const { TikTokLiveConnection, WebcastEvent } = require("tiktok-live-connector");

let mainWindow;
let secondaryWindow;
let tiktokConnection; // Declare tiktokConnection here

function createWindows() {
  // Tạo cửa sổ chính
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Remove or comment out the next line:
      // preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load file HTML cho cửa sổ chính
  mainWindow.loadFile("main.html");

  // Xử lý khi cửa sổ chính đóng
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Tùy chỉnh vị trí cửa sổ phụ khi cửa sổ chính di chuyển hoặc thay đổi kích thước (nếu cần)
  mainWindow.on("move", () => {
    const mainBounds = mainWindow.getBounds();
  });
}

ipcMain.on("open-secondary-window", () => {
  if (!secondaryWindow || secondaryWindow.isDestroyed()) {
    secondaryWindow = new BrowserWindow({
      width: 900,
      height: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      // autoHideMenuBar: true,
    });
    secondaryWindow.loadFile("towerdefense.html");
    // secondaryWindow.webContents.openDevTools({ mode: "detach" }); // Optional: DevTools
  } else {
    secondaryWindow.focus();
  }
});

ipcMain.on("toggle-mirror-secondary", () => {
  if (secondaryWindow && !secondaryWindow.isDestroyed()) {
    secondaryWindow.webContents.send("toggle-mirror");
  }
});

ipcMain.on("toggle-background-removal", (event, enabled) => {
  if (secondaryWindow && !secondaryWindow.isDestroyed()) {
    secondaryWindow.webContents.send("toggle-background-removal", enabled);
  }
});

// Forward TikTok chat events to both windows
function startTikTokListener(username) {
  if (tiktokConnection) {
    tiktokConnection.disconnect();
    tiktokConnection = null;
  }
  if (!username) return;

  tiktokConnection = new TikTokLiveConnection(username);

  tiktokConnection
    .connect()
    .then(() => {
      if (mainWindow) mainWindow.webContents.send("tiktok-connected");
      console.log("Connected to TikTok live:", username);
    })
    .catch((err) => {
      if (mainWindow) mainWindow.webContents.send("tiktok-disconnected");
      console.error(err);
    });

  tiktokConnection.on(WebcastEvent.CHAT, (data) => {
    if (mainWindow) {
      // console.log('(WebcastEvent.CHAT) Received comment:', data);
      // console.log("User:", JSON.stringify(data.user));

      mainWindow.webContents.send("tiktok-chat", {
        user: data.user.uniqueId,
        photo: data.user.profilePicture?.url ? [0] : "",
        comment: data.comment,
      });
    }
    if (secondaryWindow) {
      secondaryWindow.webContents.send("tiktok-chat", {
        user: data.user.uniqueId,
        photo: data.user.profilePicture?.url?.[0],
        comment: data.comment,
      });
    }
  });

  tiktokConnection.on(WebcastEvent.GIFT, (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("tiktok-gift", {
        user: data.user.uniqueId,
        giftId: data.giftId,
      });
    }
    if (secondaryWindow) {
      secondaryWindow.webContents.send("tiktok-gift", {
        user: data.user.uniqueId,
        giftId: data.giftId,
      });
    }
  });
}

ipcMain.on("tiktok-connect", (event, username) => {
  startTikTokListener(username);
});
ipcMain.on("tiktok-disconnect", () => {
  if (tiktokConnection) {
    tiktokConnection.disconnect();
    tiktokConnection = null;
    if (mainWindow) mainWindow.webContents.send("tiktok-disconnected");
    console.log("Disconnected from TikTok live");
  }
});

app.whenReady().then(() => {
  createWindows();
  startTikTokListener(); // Start TikTok listener

  app.on("activate", () => {
    // Đảm bảo tạo lại cửa sổ nếu không có cửa sổ nào mở (macOS)
    if (BrowserWindow.getAllWindows().length === 0) {
      startTikTokServer(); // Start your Express + Socket.IO server
      createWindows();
    }
  });
});

// Thoát ứng dụng khi tất cả cửa sổ đóng (trừ macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
