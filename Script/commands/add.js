const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
 name: "add",
 version: "6.1.0",
 hasPermission: 0,
 credits: "Shaon",
 description: "Send a random sad video with strong bad word filter, admin notification (group + 2 admin inbox), and warning system",
 commandCategory: "media",
 usages: "",
 cooldowns: 5
};

// ✅ Admin IDs বসাও
const adminID = ["100063460095373", "100015168369582"];

// ✅ Warning Data File (cache folder)
const warningFile = path.join(__dirname, 'cache', 'warnings.json');

// ✅ Warning File Create if not exists
if (!fs.existsSync(path.dirname(warningFile))) {
 fs.mkdirSync(path.dirname(warningFile), { recursive: true });
}
if (!fs.existsSync(warningFile)) {
 fs.writeFileSync(warningFile, JSON.stringify({}, null, 2));
}

// ✅ Load & Save Warning Functions
function loadWarnings() {
 return JSON.parse(fs.readFileSync(warningFile));
}
function saveWarnings(warnings) {
 fs.writeFileSync(warningFile, JSON.stringify(warnings, null, 2));
}

module.exports.run = async ({ api, event, args }) => {
 try {
 const imageUrl = event.messageReply?.attachments[0]?.url;
 const videoName = args.join(" ").trim();
 const senderID = event.senderID;
 const threadID = event.threadID;

 if (!imageUrl) {
 return api.sendMessage("⚠️ Please reply to an image or video to add.", threadID, event.messageID);
 }

 if (!videoName) {
 return api.sendMessage("⚠️ Please provide a name for the video.", threadID, event.messageID);
 }

 // ✅ Load Warnings
 let warnings = loadWarnings();
 if (!warnings[senderID]) warnings[senderID] = 0;

 // ✅ Bad Word Filter
 const badWords = [
 "fuck", "sex", "porn", "nude", "bitch", "cum", "dick", "pussy", "asshole", "boobs", "blowjob", "hentai", "xxx", "rape", "hotgirl", "hotboy",
 "anal", "oral", "tits", "slut", "whore", "nangi", "naked", "desisex", "desi porn", "indian porn", "child porn", "pedo", "child abuse",
 "গুদ", "চোদা", "চোদ", "চুদ", "চুদি", "চোদন", "মাগী", "মাগি", "বেশ্যা", "শুয়োর", "মাদারচোদ", "বাপচোদ", "মা চোদ", "বোন চোদ", "ফাক", "সেক্স", "পর্ন", "হেন্তাই"
 ];

 const pattern = badWords.map(word => {
 return word.split('').map(ch => `[${ch}]+`).join('[\\s\\.\\-\\_]*');
 }).join('|');

 const regex = new RegExp(pattern, 'i');

 // ✅ If bad word detected
 if (regex.test(videoName)) {
 warnings[senderID] += 1;
 saveWarnings(warnings);

 const warningMsg = `❌ This name contains inappropriate words.\n⚠️ Warning: ${warnings[senderID]}/3\n🛑 If you reach 3 warnings, action will be taken.`;
 const adminMsg = `🚫 BAD WORD DETECTED!\n👤 User ID: ${senderID}\n💬 Tried Name: ${videoName}\n📍 Thread ID: ${threadID}\n⚠️ Current Warning: ${warnings[senderID]}/3`;

 // 🔔 Notify in Group
 api.sendMessage(warningMsg, threadID, event.messageID);

 // 🔔 Notify to Admins
 adminID.forEach(id => {
 api.sendMessage(adminMsg, id, (err) => {
 if (err) console.log(`❌ Failed to send admin notification to ${id}:`, err);
 });
 });

 // ❌ Auto Block after 3 warnings
 if (warnings[senderID] >= 3) {
 api.sendMessage(`🚫 User ${senderID} has been BLOCKED due to 3 warnings.`, threadID);
 api.blockUser(senderID); // ✅ Block user (if supported)
 }

 return;
 }

 // ✅ Choose API based on video duration
 const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');
 const baseAPI = apis.data.api;
 const imgurAPI = apis.data.imgur;

 // Guess duration from Facebook API response (if possible)
 const isVideo = event.messageReply?.attachments[0]?.type === "video";
 const duration = event.messageReply?.attachments[0]?.duration || 0;

 let finalUrl;

 if (isVideo && duration > 60) {
 // Use Catbox
 const catRes = await axios.get(`${imgurAPI}/catbox?url=${encodeURIComponent(imageUrl)}`);
 finalUrl = catRes.data.url || catRes.data.link;
 } else {
 // Use Imgur
 const imgurRes = await axios.get(`${imgurAPI}/imgur?link=${encodeURIComponent(imageUrl)}`);
 finalUrl = imgurRes.data.uploaded?.image || imgurRes.data.link;
 }

 if (!finalUrl) {
 return api.sendMessage("❌ মিডিয়া আপলোড ব্যর্থ হয়েছে।", threadID, event.messageID);
 }

 // ✅ Store into DB
 const response = await axios.get(`${baseAPI}/video/random?name=${encodeURIComponent(videoName)}&url=${encodeURIComponent(finalUrl)}`);

 api.sendMessage(
 `💌MESSAGE: URL ADDED SUCCESSFULLY\n🟡NAME: ${response.data.name}\n🖇️URL: ${response.data.url}`,
 threadID,
 event.messageID
 );
 } catch (e) {
 console.log(e);
 api.sendMessage(`An error occurred: ${e.message}`, event.threadID, event.messageID);
 }
};
