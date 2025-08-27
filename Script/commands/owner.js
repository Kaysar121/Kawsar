const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: "owner",
    version: "1.0.0",
    author: "Kawsar",
    description: "Display the bot owner's information with a GIF and ASCII design.",
    adminOnly: false,
    commandCategory: "Utility",
    guide: "Type 'owner' to see the bot owner's information.",
    cooldowns: 5,
    usePrefix: false,

    async execute({ api, event }) {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const ownerInfo = {
            name: "Kawsar Hossain",
            github: "https://github.com/Kawsar9340",
            facebook: "https://www.facebook.com/Kawsar9340",
            email: "kmd184643@gmail.com",
            bio: "Developer and creator of Angel Khusi. Passionate about coding and AI."
        };

        const gifPath = path.join(__dirname, '../../assets/owner.gif');

        try {
 
            const asciiArt = `
╔════════════════════╗
║     OWNER INFO     ║
╠════════════════════╣
║ Name: ${ownerInfo.name}      ║
╟────────────────────╢
║ GitHub: ${ownerInfo.github}  ║
║ Facebook: ${ownerInfo.facebook} ║
║ Email: ${ownerInfo.email}    ║
║ Bio: ${ownerInfo.bio}        ║
╚════════════════════╝
Feel free to reach out! 😊
`;

    
            if (!fs.existsSync(gifPath)) {
                console.log(`GIF file not found at ${gifPath}`);
                throw new Error(`GIF file not found at ${gifPath}`);
            }
            console.log(`Using local GIF from ${gifPath}`);


            const msg = {
                body: asciiArt,
                attachment: fs.createReadStream(gifPath)
            };

            await api.sendMessage(msg, threadID, messageID);
            console.log(`Sent owner info with local GIF to thread ${threadID}`);

        } catch (error) {
            console.log(`Error in owner command: ${error.message}`);
           
            const fallbackMessage = `❌ Failed to display owner info with GIF: ${error.message}\n\n` +
                                   `👤 **Owner Information** 👤\n\n` +
                                   `Name: ${ownerInfo.name}\n` +
                                   `GitHub: ${ownerInfo.github}\n` +
                                   `Facebook: ${ownerInfo.facebook}\n` +
                                   `Email: ${ownerInfo.email}\n` +
                                   `Bio: ${ownerInfo.bio}\n\n` +
                                   `Feel free to reach out! 😊`;
            await api.sendMessage(fallbackMessage, threadID, messageID);
        }
    }
};
