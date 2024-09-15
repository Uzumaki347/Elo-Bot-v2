module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.0",
    author: "Gohime Hatake",
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime "
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "system",
    guide: {
      en: "Use {p}totalusers to display the total number of users of the bot and check uptime."
    }
  },
  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
const permission = ["61553647340193",];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("- Bitch, Only my Boss Mr Elohime hatake can use this👿🖕🏽", event.threadID, event.messageID);
    }
      const uptime = process.uptime();
      
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `⌠ ${days} ⌡ ‹‹days››\n⌠ ${hours} ⌡ ‹‹hours››\n⌠ ${minutes} ⌡ ‹‹minutes››\n⌠ ${seconds} ⌡ ‹‹seconds››`;
      
      api.sendMessage(`⏰ | Bot running time\n${uptimeString}`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
