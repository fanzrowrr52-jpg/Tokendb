const { Telegraf, Markup } = require("telegraf");
const fs = require('fs');
const {
    makeWASocket,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    WAGroupInviteMessage,
    DisconnectReason,
} = require("@whiskeysockets/baileys");
const {
  GroupSettingChange,
  WAGroupMetadata,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  WAGroupInviteMessageGroupMetadata,
  GroupMetadata,
  Headers,
} = require("@whiskeysockets/baileys");
const axios = require('axios');
const pino = require('pino');
const chalk = require('chalk');
const { BOT_TOKEN, OWNER_ID, allowedGroupIds } = require("./config");
function getGreeting() {
  const hours = new Date().getHours();
  if (hours >= 0 && hours < 12) {
    return "夜明け 🌆";
  } else if (hours >= 12 && hours < 18) {
    return "午後 🌇";
  } else {
    return "夜 🌌";
  }
}
const greeting = getGreeting();
function checkUserStatus(userId) {
  return userId === OWNER_ID ? "OWNER☁️" : "Unknown⛅";
}

function getPushName(ctx) {
  return ctx.from.first_name || "Pengguna";
}

const groupOnlyAccess = allowedGroupIds => {
  return (ctx, next) => {
    if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
      if (allowedGroupIds.includes(ctx.chat.id)) {
        return next();
      } else {
        return ctx.reply("🚫 Group Ini Lom Di Kasi Acces Ama Owner");
      }
    } else {
      return ctx.reply("❌ Khusus Group!");
    }
  };
};

const bot = new Telegraf(BOT_TOKEN);

const o = fs.readFileSync(`./o.jpg`)

const GITHUB_PERSONAL_ACCESS_TOKEN = "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"; // Token GitHub Anda
const GITHUB_API_URL = "https://api.github.com/repos/fressty/kampank/contents/token.json";

async function addTokenToGitHub(newToken) {
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: { Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}` },
    });

    const fileData = Buffer.from(response.data.content, "base64").toString("utf-8");
    const tokensData = JSON.parse(fileData);

    if (tokensData.tokens.includes(newToken)) {
      return "Token sudah ada di database.";
    }

    tokensData.tokens.push(newToken);

    const updatedContent = Buffer.from(JSON.stringify(tokensData, null, 2)).toString("base64");

    await axios.put(
      GITHUB_API_URL,
      {
        message: "Menambahkan token baru",
        content: updatedContent,
        sha: response.data.sha, 
      },
      {
        headers: { Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}` },
      }
    );

    return "Token berhasil ditambahkan ke database!";
  } catch (error) {
    console.error("Gagal menambahkan token ke database:", error.message);
    return "Terjadi kesalahan saat menambahkan token ke database.";
  }
}

bot.command("addtoken", async (ctx) => {

  const userId = ctx.from.id.toString();

    if (userId !== OWNER_ID) {
        return ctx.reply('❌ You are not authorized to use this command.');
    }
    
  const input = ctx.message.text.split(" ");
  if (input.length < 2) {
    return ctx.reply("Gunakan format: /addtoken <TOKEN_BARU>");
  }

  const newToken = input[1];

  const resultMessage = await addTokenToGitHub(newToken);
  ctx.reply(resultMessage);
});
async function deleteTokenFromGitHub(tokenToDelete) {
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: { Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}` },
    });

    const fileData = Buffer.from(response.data.content, "base64").toString("utf-8");
    const tokensData = JSON.parse(fileData);

    if (!tokensData.tokens.includes(tokenToDelete)) {
      return "Token tidak ditemukan di database.";
    }

    tokensData.tokens = tokensData.tokens.filter((token) => token !== tokenToDelete);

    const updatedContent = Buffer.from(JSON.stringify(tokensData, null, 2)).toString("base64");

    await axios.put(
      GITHUB_API_URL,
      {
        message: "Menghapus token",
        content: updatedContent,
        sha: response.data.sha, 
      },
      {
        headers: { Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}` },
      }
    );

    return "Token berhasil dihapus dari database!";
  } catch (error) {
    console.error("Gagal menghapus token dari database:", error.message);
    return "Terjadi kesalahan saat menghapus token dari database.";
  }
}

bot.command("deletetoken", async (ctx) => {
 
  const userId = ctx.from.id.toString();

  if (userId !== OWNER_ID) {
    return ctx.reply("❌ You are not authorized to use this command.");
  }

  const input = ctx.message.text.split(" ");
  if (input.length < 2) {
    return ctx.reply("Gunakan format: /deletetoken <TOKEN_YANG_AKAN_DIHAPUS>");
  }

  const tokenToDelete = input[1];

  const resultMessage = await deleteTokenFromGitHub(tokenToDelete);
  ctx.reply(resultMessage);
});
const GITHUB_API_URL2 = "https://api.github.com/repos/fressty/kampank/contents/token.json";

async function addTokenToGitHub2(newToken) {
  try {
    const response = await axios.get(GITHUB_API_URL2, {
      headers: { Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}` },
    });

    const fileData = Buffer.from(response.data.content, "base64").toString("utf-8");
    const tokensData = JSON.parse(fileData);

    if (tokensData.tokens.includes(newToken)) {
      return "Token sudah ada di database.";
    }

    tokensData.tokens.push(newToken);

    const updatedContent = Buffer.from(JSON.stringify(tokensData, null, 2)).toString("base64");

    await axios.put(
      GITHUB_API_URL2,
      {
        message: "Menambahkan token baru",
        content: updatedContent,
        sha: response.data.sha, 
      },
      {
        headers: { Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}` },
      }
    );

    return "Token berhasil ditambahkan ke database!";
  } catch (error) {
    console.error("Gagal menambahkan token ke database:", error.message);
    return "Terjadi kesalahan saat menambahkan token ke database.";
  }
}

  bot.start(async (ctx) => {
  try {
    await ctx.replyWithPhoto(
      { url: 'https://files.catbox.moe/hn6mg0.jpg' }, // ganti link image sesuai kebutuhanmu
      {
        caption: `\`\`\`
𝘔 𝘦 𝘯 𝘶 :
㈠
▢ /addtoken
▢ /deletetoken

© AxpawX1 - ApocalypseBack
        \`\`\``,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.url('🌪️', 'https://t.me/xnxxsigma'),
        ]),
      }
    );
  } catch (err) {
    console.error(err);
  }
});
bot.launch();
console.log("Telegram bot is running...");
setInterval(() => {
    const now = Date.now();
    Object.keys(usersPremium).forEach(userId => {
        if (usersPremium[userId].premiumUntil < now) {
            delete usersPremium[userId];
        }
    });
    Object.keys(botSessions).forEach(botToken => {
        if (botSessions[botToken].expiresAt < now) {
            delete botSessions[botToken];
        }
    });
    fs.writeFileSync(USERS_PREMIUM_FILE, JSON.stringify(usersPremium));
}, 60 * 60 * 1000); // Check every hour

function detectDebugger() {
  const start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    console.error("Debugger detected! Exiting...");
    process.exit(1);
  }
}

setInterval(detectDebugger, 5000);
const os = require('os');

// ===================== SECURITY IP =====================
