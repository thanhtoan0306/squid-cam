const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let secondaryWindow;

function createWindows() {
  // Tạo cửa sổ chính
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Tùy chọn: nếu cần preload script
      nodeIntegration: true, // Cân nhắc vấn đề bảo mật nếu bật
      contextIsolation: false, // Cân nhắc vấn đề bảo mật nếu tắt
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
    // Nếu cửa sổ phụ chưa mở hoặc đã đóng thì tạo lại
    // Đảm bảo bạn có hàm tạo secondaryWindow, ví dụ như createWindows() hoặc tách riêng hàm tạo secondary window
    // Nếu bạn đã có sẵn đoạn tạo secondaryWindow thì gọi lại đoạn đó
    // Ví dụ:
    // secondaryWindow = new BrowserWindow({
    //   width: 360,
    //   height: 640,
    //   parent: mainWindow,
    //   x: mainWindow.getBounds().x + mainWindow.getBounds().width,
    //   y: mainWindow.getBounds().y,
    //   webPreferences: {
    //     nodeIntegration: true,
    //     contextIsolation: false,
    //   },
    //   frame: true, // Có khung cửa sổ (giữ nút close)
    //   minimizable: false, // Không cho thu nhỏ
    //   maximizable: false, // Không cho phóng to
    //   closable: true, // Cho phép đóng
    //   autoHideMenuBar: true, // Ẩn menu bar
    //   resizable: false, // Không cho resize
    // });
    secondaryWindow = new BrowserWindow({
      width: 360,
      height: 640,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"), // Tùy chọn: nếu cần preload script
        nodeIntegration: true, // Cân nhắc vấn đề bảo mật nếu bật
        contextIsolation: false, // Cân nhắc vấn đề bảo mật nếu tắt
      },
      autoHideMenuBar: true, // Ẩn menu bar
    });
    secondaryWindow.loadFile("cam2mediapipe.html");
    secondaryWindow.webContents.openDevTools({ mode: "detach" }); // mode 'detach' mở ra cửa sổ riêng, có thể dùng 'right', 'bottom', 'undocked'
  } else {
    // Nếu đã có thì chỉ cần focus
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

app.whenReady().then(() => {
  createWindows();

  app.on("activate", () => {
    // Đảm bảo tạo lại cửa sổ nếu không có cửa sổ nào mở (macOS)
    if (BrowserWindow.getAllWindows().length === 0) {
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
