var Discord = require("discord.js");
var axios = require("axios");
var _ = require("lodash");
var moment = require("moment");
var tz = require("moment-timezone");

var config = require("./config.json");
var bot = new Discord.Client();
var ripUrl = "http://is.steam.rip/api/v1/?request=IsSteamRip";
var statusChannel;

bot.on("ready", () => {
	console.log(`Ready to begin. Serving in ${bot.channels.length} channels.`);

	statusChannel = bot.channels.find(channel => channel.server.name === config.server && channel.name === config.channel);

	if( !statusChannel ) {
		console.log("Unable to find #steamstatus. Exiting.");
		process.exit(1);
	}

	setInterval( checkRip( statusChannel ), 10 * 1000 );
});

bot.on("disconnected", () => {
	console.log("Disconnected!");
	process.exit(1);
});

bot.login( config.user, config.password );

function checkRip( channel ) {
	var lastStatus = {};

	return function() {
		axios.get( ripUrl ).then(response => {
			var status = response.data.result;

			if( !_.isEqual( lastStatus, status ) ) {
				bot.sendMessage( channel, stringifyStatus( status ) );
			}

			lastStatus = status;
		});
	}
}

function stringifyStatus( status ) {
	return `${getDate()} - Steam is ${status.isSteamRip ? "RIP" : "OK"}:

\`\`\`js
${JSON.stringify(status, null, 2)}
\`\`\`
`;
}

function getDate() {
	return moment().tz("America/Los_Angeles").format("DD MMM YYYY HH:mm:ss");
}