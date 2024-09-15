const fs = require('fs');

const axios = require('axios');



module.exports = {

    config: {

        name: "video",

        version: "4.6",

        author: "Gohime Hatake",

        shortDescription: { 

        en: 'Search and download videos' 

       },

        longDescription: { 

        en: "Search for video and download the first result or select a specific track." 

      },

        category: "music",

        guide: { 

            en: '{p}s <song name> - Search for a song\n' +

                'Example:\n' +

                '  {p}s Blinding Lights\n' +

                'After receiving the search results, reply with the song ID to download the track.\n' +

                'Reply with "1 to 6" to download the first track in the list.'

        }

    },



    onStart: async function ({ api, event, args }) {

        const searchQuery = encodeURIComponent(args.join(" "));

        const apiUrl = `https://global-sprak.onrender.com/api/ytb/v1?search=${searchQuery}`;

        

        if (!searchQuery) {

            return api.sendMessage("Please provide the name of the song you want to search.", event.threadID, event.messageID);

        }



        try {

            api.sendMessage("🎵 | Searching for music. Please wait...", event.threadID, event.messageID);

            const response = await axios.get(apiUrl);

            const tracks = response.data;



            if (tracks.length > 0) {

                const topTracks = tracks.slice(0, 6);

                let message = "🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\n🎶 | Here are the top 6 tracks\n\n";

                const attachments = await Promise.all(topTracks.map(async (track) => {

                    return await global.utils.getStreamFromURL(track.thumbnail);

                }));



                topTracks.forEach((track, index) => {

                    message += `🆔 𝗜𝗗: ${index + 1}\n`;

                    message += `📝 𝗧𝗶𝘁𝗹𝗲: ${track.title}\n`;

                    message += `📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲: ${track.publishDate}\n`;

                    message += "━━━━━━━━━━━━━\n"; // Separator between tracks

                });



                message += "\nReply with the number of the song ID you want to download.";

                api.sendMessage({

                    body: message,

                    attachment: attachments

                }, event.threadID, (err, info) => {

                    if (err) return console.error(err);

                    global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, messageID: info.messageID, author: event.senderID, tracks: topTracks });

                });

            } else {

                api.sendMessage("❓ | Sorry, couldn't find the requested music.", event.threadID);

            }

        } catch (error) {

            console.error(error);

            api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);

        }

    },



    onReply: async function ({ api, event, Reply, args }) {

        const reply = parseInt(args[0]);

        const { author, tracks } = Reply;



        if (event.senderID !== author) return;



        try {

            if (isNaN(reply) || reply < 1 || reply > tracks.length) {

                throw new Error("Invalid selection. Please reply with a number corresponding to the track.");

            }



            const selectedTrack = tracks[reply - 1];

            const videoUrl = `https://www.youtube.com/watch?v=${selectedTrack.videoId}`;

            const downloadApiUrl = `https://fgryegecevdhhf.onrender.com/download?url=${encodeURIComponent(videoUrl)}`;



            api.sendMessage("⏳ | Downloading your song, please wait...", event.threadID, async (err, info) => {

                if (err) return console.error(err);



                try {

                    const downloadLinkResponse = await axios.get(downloadApiUrl);

                    const downloadLink = downloadLinkResponse.data.video_hd;



                    const filePath = `${__dirname}/cache/${Date.now()}.mp3`;

                    const writer = fs.createWriteStream(filePath);



                    const response = await axios({

                        url: downloadLink,

                        method: 'GET',

                        responseType: 'stream'

                    });



                    response.data.pipe(writer);



                    writer.on('finish', () => {

                        api.setMessageReaction("✅", info.messageID);

                        

                        api.sendMessage({

                            body: `🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nHere's your music ${selectedTrack.title}.\n\n📒 𝗧𝗶𝘁𝗹𝗲: ${selectedTrack.title}\n📅 𝗣𝘂𝗯𝗹𝗶𝘀𝗵 𝗗𝗮𝘁𝗲: ${selectedTrack.publishDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${selectedTrack.viewCount}\n👍 𝗟𝗶𝗸𝗲𝘀: ${selectedTrack.likeCount}\n\nEnjoy listening!...🥰`,

                            attachment: fs.createReadStream(filePath),

                        }, event.threadID, () => fs.unlinkSync(filePath));

                    });



                    writer.on('error', (err) => {

                        console.error(err);

                        api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);

                    });

                } catch (error) {

                    console.error(error);

                    api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);

                }

            });



        } catch (error) {

            console.error(error);

            api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);

        }



        api.unsendMessage(Reply.messageID);

        global.GoatBot.onReply.delete(Reply.messageID);

    }

};
