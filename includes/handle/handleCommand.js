module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity"),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Manila").format("HH:mm:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly, YASSIN } = global.config;

    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    var { body, senderID, threadID, messageID } = event;

    senderID = String(senderID);
    threadID = String(threadID);
    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : PREFIX;
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);

    const [matchedPrefix] = body.match(prefixRegex) || [null];
    const args = matchedPrefix ? body.slice(matchedPrefix.length).trim().split(/ +/) : body.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);
    if (YASSIN === "true" && !ADMINBOT.includes(senderID)) return;
    if (!command) {
      var allCommandName = [];
      const commandValues = commands.keys();
      for (const cmd of commandValues) allCommandName.push(cmd);
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);

      if (checker.bestMatch.rating >= 0.8) {
        command = client.commands.get(checker.bestMatch.target);
      } else if (matchedPrefix) {
        const closestMatch = checker.bestMatch.target;
        api.sendMessage(
          `❌ 𝑪𝒐𝒎𝒎𝒂𝒏𝒅 '${commandName}' 𝒏𝒐𝒕 𝒇𝒐𝒖𝒏𝒅.\n👉 𝑵𝒀𝑶 𝒎𝒆𝒂𝒏 '${closestMatch}'?`,
          threadID,
          messageID
        );
        return;
      }
    }

    if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox === false && senderID == threadID)) {
      if (!ADMINBOT.includes(senderID)) {
        if (userBanned.has(senderID)) {
          const { reason, dateAdded } = userBanned.get(senderID) || {};
          return api.sendMessage(
            `🚫 𝑼𝒔𝒆𝒓 𝑩𝒂𝒏𝒏𝒆𝒅\n📝 𝑹𝒆𝒂𝒔𝒐𝒏: ${reason}\n📅 𝑫𝒂𝒕𝒆: ${dateAdded}\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
            threadID,
            async (err, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID
          );
        } else if (threadBanned.has(threadID)) {
          const { reason, dateAdded } = threadBanned.get(threadID) || {};
          return api.sendMessage(
            `🚫 𝑻𝒉𝒓𝒆𝒂𝒅 𝑩𝒂𝒏𝒏𝒆𝒅\n📝 𝑹𝒆𝒂𝒔𝒐𝒏: ${reason}\n📅 𝑫𝒂𝒕𝒆: ${dateAdded}\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
            threadID,
            async (err, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID
          );
        }
      }
    }

    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [];
        const banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name)) {
          return api.sendMessage(
            `⛔ 𝑪𝒐𝒎𝒎𝒂𝒏𝒅 '${command.config.name}' 𝒊𝒔 𝒃𝒂𝒏𝒏𝒆𝒅 𝒊𝒏 𝒕𝒉𝒊𝒔 𝒕𝒉𝒓𝒆𝒂𝒅.\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
            threadID,
            async (err, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID
          );
        } else if (banUsers.includes(command.config.name)) {
          return api.sendMessage(
            `⛔ 𝑪𝒐𝒎𝒎𝒂𝒏𝒅 '${command.config.name}' 𝒊𝒔 𝒃𝒂𝒏𝒏𝒆𝒅 𝒇𝒐𝒓 𝒚𝒐𝒖.\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
            threadID,
            async (err, info) => {
              await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            },
            messageID
          );
        }
      }
    }

    if (command.config.commandCategory.toLowerCase() == "nsfw" &&
      !global.data.threadAllowNSFW.includes(threadID) &&
      !ADMINBOT.includes(senderID)) {
      return api.sendMessage(
        `⚠️ 𝑻𝒉𝒊𝒔 𝒕𝒉𝒓𝒆𝒂𝒅 𝒅𝒐𝒆𝒔 𝒏𝒐𝒕 𝒂𝒍𝒍𝒐𝒘 𝑵𝑺𝑭𝑾.\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
        threadID,
        async (err, info) => {
          await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
          return api.unsendMessage(info.messageID);
        },
        messageID
      );
    }

    var permssion = 0;
    const threadInfoo = threadInfo.get(threadID) || await Threads.getInfo(threadID);
    const find = threadInfoo.adminIDs.find((el) => el.id == senderID);
    if (ADMINBOT.includes(senderID.toString())) permssion = 2;
    else if (find) permssion = 1;
    if (command.config.hasPermssion > permssion) {
      return api.sendMessage(
        `🚫 𝑷𝒆𝒓𝒎𝒊𝒔𝒔𝒊𝒐𝒏 𝒏𝒐𝒕 𝒆𝒏𝒐𝒖𝒈𝒉 𝒇𝒐𝒓 '${command.config.name}'.\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
        event.threadID,
        event.messageID
      );
    }

    if (!client.cooldowns.has(command.config.name)) {
      client.cooldowns.set(command.config.name, new Map());
    }
    const timestamps = client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) {
      return api.setMessageReaction("⏳", event.messageID, (err) =>
        err ? logger("❌ 𝑬𝒓𝒓𝒐𝒓 𝒐𝒏 𝒔𝒆𝒕𝑴𝒆𝒔𝒔𝒂𝒈𝒆𝑹𝒆𝒂𝒄𝒕𝒊𝒐𝒏", 2) : "", true);
    }

    try {
      const Obj = {
        api, event, args, models, Users, Threads, Currencies, permssion, getText: () => {}
      };
      command.run(Obj);
      timestamps.set(senderID, dateNow);
      if (DeveloperMode) {
        logger(
          `⚡ [ 𝑫𝑬𝑽 𝑴𝑶𝑫𝑬 ]\n⏱️ 𝑻𝒊𝒎𝒆: ${time}\n🤖 𝑩𝒐𝒕: 𝑵𝒀𝑶\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍\n💻 𝑪𝒐𝒎𝒎𝒂𝒏𝒅: ${commandName}\n👤 𝑼𝒔𝒆𝒓: ${senderID}\n💬 𝑻𝒉𝒓𝒆𝒂𝒅: ${threadID}\n📝 𝑨𝒓𝒈𝒔: ${args.join(" ")}\n⚡ 𝑻𝒊𝒎𝒆 𝒕𝒂𝒌𝒆𝒏: ${Date.now() - dateNow}ms`,
          ""
        );
      }
      return;
    } catch (e) {
      return api.sendMessage(
        `❌ 𝑬𝒓𝒓𝒐𝒓 𝒊𝒏 𝒄𝒐𝒎𝒎𝒂𝒏𝒅 '${commandName}': ${e}\n👨🏻‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔: 𝑨𝒃𝒅𝒆𝒍𝒂𝒛𝒊𝒛 & 𝑲𝒉𝒂𝒍𝒊𝒍`,
        threadID
      );
    }
  };
};