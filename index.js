const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const endpoint = process.env.API_URL;

async function fetchData() {
  try {
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function sendServerInfo(chatId) {
  const data = await fetchData();
  if (data) {
    const message = `
            Server: PiCloud_v1
        Hostname: ${data.hostname}
        Platform: ${data.platform}
        Architecture: ${data.architecture}
        Memory Total: ${convertBytesToGB(data.memory.total)} GB
        Memory Free: ${convertBytesToGB(data.memory.free)} GB
        Storage Total: ${data.storage.total} GB
        Storage Available: ${data.storage.available} GB
        Storage Percentage: ${data.storage.percentage}%
        Server Time: ${data.serverTime}
        `;

    function convertBytesToGB(bytes) {
      const GB = bytes / (1024 * 1024 * 1024);
      return GB.toFixed(2);
    }
    bot.sendMessage(chatId, message);
  } else {
    bot.sendMessage(
      chatId,
      "Failed to fetch server info. Please try again later."
    );
  }
}

const menu = {
  reply_markup: {
    keyboard: [["/info"]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome to Server Info Bot! for PiCloud. Click the button below to get real time server info:",
    menu
  );
});

bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  sendServerInfo(chatId);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Loading server info", menu);
});

console.log("Bot is running...");
