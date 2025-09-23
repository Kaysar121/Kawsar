const axios = require("axios");

module.exports.config = {
 name: "quiz",
 version: "2.3.0",
 hasPermssion: 0,
 credits: "MAHBUBU ULLASH × RUBISH API",
 description: "Bangla Quiz with Coins System",
 usePrefix: false,
 commandCategory: "Game",
 usages: "quiz [h]",
 cooldowns: 1,
 dependencies: { "axios": "" }
};

const timeoutDuration = 20 * 1000;

module.exports.run = async function ({ api, event, args, Currencies }) {
 const { threadID, messageID, senderID } = event;
 const { getData } = Currencies;

 const userData = await getData(senderID);
 const balance = userData.money || 0;

 if (balance < 1) {
 return api.sendMessage("❌ You don't have enough Coins to play! Minimum 1 Coins required.", threadID, messageID);
 }

 if (args[0]?.toLowerCase() === "h") {
 return api.sendMessage(
 `🧠 Quiz Guide:\n\n` +
 `➤ Command: quiz\n` +
 `➤ Correct Answer: +500000 Coins\n` +
 `➤ Wrong Answer: -500 Coins\n` +
 `➤ Minimum 0 Coins required to play\n` +
 `➤ 20 seconds to answer\n\n` +
 `⚡ Good Luck!`, threadID, messageID
 );
 }

 try {
 const res = await axios.get(`https://rubish-apihub.onrender.com/rubish/quiz-api?category=Bangla&apikey=rubish69`);
 const data = res.data;

 if (!data.question || !data.answer) throw new Error("Invalid quiz data");

 const formatted = 
`╭──✦ ${data.question}
├‣ 𝗔) ${data.A}
├‣ 𝗕) ${data.B}
├‣ 𝗖) ${data.C}
├‣ 𝗗) ${data.D}
╰──────────────────‣
Reply with your answer (A/B/C/D). ⏰ 20s`;

 return api.sendMessage(formatted, threadID, async (err, info) => {
 if (err) return console.error("Send error:", err);

 const timeout = setTimeout(async () => {
 const index = global.client.handleReply.findIndex(e => e.messageID === info.messageID);
 if (index !== -1) {
 try {
 await api.unsendMessage(info.messageID);
 api.sendMessage(`⏰ Time's up!\n✅ The correct answer was: ${data.answer}`, threadID);
 } catch (e) {
 console.error("Timeout unsend error:", e);
 }
 global.client.handleReply.splice(index, 1);
 }
 }, timeoutDuration);

 global.client.handleReply.push({
 name: this.config.name,
 messageID: info.messageID,
 author: senderID,
 answer: data.answer,
 timeout
 });
 });

 } catch (err) {
 console.error("API fetch error:", err);
 return api.sendMessage("❌ Failed to load quiz data!", threadID, messageID);
 }
};

module.exports.handleReply = async function ({ api, event, handleReply, Currencies }) {
 const { senderID, messageID, threadID, body } = event;
 const { increaseMoney, decreaseMoney } = Currencies;

 if (senderID !== handleReply.author) return;

 const userAnswer = body.trim().toUpperCase(); 
 if (!["A", "B", "C", "D"].includes(userAnswer)) {
 return api.sendMessage("⚠️ Please enter a valid option: A, B, C or D", threadID, messageID);
 }

 clearTimeout(handleReply.timeout);

 try {
 if (userAnswer === handleReply.answer) {
 await api.unsendMessage(handleReply.messageID);
 await increaseMoney(senderID, 500000);
 const total = (await Currencies.getData(senderID)).money;
 return api.sendMessage(
 `✅ Congratulations! You answered correctly!\n💰 You've earned 500000 Coins`,
 threadID,
 messageID
 );
 } else {
 await decreaseMoney(senderID, 20);
 const total = (await Currencies.getData(senderID)).money;
 return api.sendMessage(
 `❌ Wrong answer!\n✅ Correct answer: ${handleReply.answer}\n💸 20 Coins deducted`,
 threadID,
 messageID
 );
 }
 } catch (e) {
 console.error("Handle reply error:", e);
 }

 const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
 if (index !== -1) global.client.handleReply.splice(index, 1);
};
