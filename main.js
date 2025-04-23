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
    // Đóng cả cửa sổ phụ khi cửa sổ chính đóng (nếu muốn)
    if (secondaryWindow) {
      secondaryWindow.close();
    }
  });

  // Tùy chỉnh vị trí cửa sổ phụ khi cửa sổ chính di chuyển hoặc thay đổi kích thước (nếu cần)
  mainWindow.on("move", () => {
    const mainBounds = mainWindow.getBounds();
    if (secondaryWindow) {
      secondaryWindow.setPosition(
        mainBounds.x + mainBounds.width,
        mainBounds.y
      );
    }
  });
}

ipcMain.on("open-secondary-window", () => {
  if (!secondaryWindow || secondaryWindow.isDestroyed()) {
    // Nếu cửa sổ phụ chưa mở hoặc đã đóng thì tạo lại
    // Đảm bảo bạn có hàm tạo secondaryWindow, ví dụ như createWindows() hoặc tách riêng hàm tạo secondary window
    // Nếu bạn đã có sẵn đoạn tạo secondaryWindow thì gọi lại đoạn đó
    // Ví dụ:
    secondaryWindow = new BrowserWindow({
      width: 360,
      height: 640,
      parent: mainWindow,
      x: mainWindow.getBounds().x + mainWindow.getBounds().width,
      y: mainWindow.getBounds().y,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      frame: true, // Có khung cửa sổ (giữ nút close)
      minimizable: false, // Không cho thu nhỏ
      maximizable: false, // Không cho phóng to
      closable: true, // Cho phép đóng
      autoHideMenuBar: true, // Ẩn menu bar
      resizable: false, // Không cho resize
    });
    secondaryWindow.loadFile("secondary.html");
  } else {
    // Nếu đã có thì chỉ cần focus
    secondaryWindow.focus();
  }
});

// Gọi hàm tạo cửa sổ khi ứng dụng sẵn sàng
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
