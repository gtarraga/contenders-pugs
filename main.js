const Discord = require('discord.js');
const tokens = require('./tokens');
const client = new Discord.Client();

//Invite link test bot https://goo.gl/yLmkAG
//Invite link https://goo.gl/MCqGC7
client.login(tokens.key);


var prefix = '!';
var i = 0;
var mainChannel;
var mainMessage;
var voiceLobby;
var voiceTeam1;
var voiceTeam2;
var setupEnabled = false;
var pugMod;
var mainGuild;


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//Getting a variable for the main message to edit
	mainChannel = client.channels.find(n => n.name == "pug-test");
	voiceLobby = client.channels.find(n => n.name == "PUG Lobby");
	voiceTeam1 = client.channels.find(n => n.name == "PUG Team1");
	voiceTeam2 = client.channels.find(n => n.name == "PUG Team2");
	mainGuild = client.guilds.first();
	pugMod = mainGuild.roles.find("name", "PUG Moderator");

	if(voiceLobby == undefined) {
		setupEnabled = true;
		console.log('voice lobby needs setup');
	}
	if(voiceTeam1 == undefined) {
		setupEnabled = true;
		console.log('team 1 voice needs setup');
	}
	if(voiceTeam2 == undefined) {
		setupEnabled = true;
		console.log('team 2 voice needs setup');
	}

	if(mainChannel == undefined) {
		setupEnabled = true;
		console.log('command channel needs setup');
	}

	if(pugMod == undefined) {
		setupEnabled = true;
		console.log('role needs setup');
	}
	else {
		mainChannel.fetchPinnedMessages()
			.then(message => {
				mainMessage = message.first();
				console.log('already setup')
			})
			.catch(console.error());
	}
});

var player = [];
var playerList = '';
var team1 = [];
var team2 = [];
var team1Text;
var team2Text;
var team1Cap;
var team2Cap;
var currentPick;
var full = false;
var pickNumber;

//Number you want - 1
var test = 11;

client.on('message', msg => {

	if(msg.content.startsWith('!setup') && setupEnabled) {

		msg.guild.createRole({
			name: 'PUG Moderator',
			color: '#42e2f4',
		})
			.then(channel => console.log('Created new role PUG Moderator'))
			.catch(console.error());

		msg.guild.createChannel('PUG Lobby', 'voice')
			.then(channel => console.log('Created new channel PUG Lobby'))
			.catch(console.error());

		msg.guild.createChannel('PUG Team1', 'voice')
			.then(channel => console.log('Created new channel PUG Team1'))
			.catch(console.error());

		msg.guild.createChannel('PUG Team2', 'voice')
			.then(channel => console.log('Created new channel PUG Team2'))
			.catch(console.error());

		msg.guild.createChannel('pug-test', 'text')
			.then(channel => {
				console.log('Created new channel pug-test');
				channel.send('**To enter in queue type `!queue`**')
					.then(message => {
						mainMessage = message;
						message.pin()
							.then(console.log('pinned main message'))
							.catch(console.error());
					})
					.catch(console.error());
			})
			.catch(console.error());
	}

	if(msg.channel == mainChannel) {
		if (msg.content.startsWith('!restart')){
			if(msg.member.roles.has(pugMod.id)) restart();
			msg.delete();
	    }


		if(msg.content.startsWith('!end') && full) {
			if(msg.member.roles.has(pugMod.id) || msg.author == team1Cap || msg.author == team2Cap) restart();
			msg.delete();
		}

		if(!full) {

			if (msg.content.startsWith('!queue')) {

				if(msg.member.voiceChannelID == voiceLobby.id) {

					if(player.filter(f => f === msg.member).length > 0) console.log('inside');
					else{
						player.push(msg.member);
						console.log(player);

						if(i < test) {

							playerList += '\n' + player[i].toString();
							mainMessage.edit(("To enter in queue **join PUG Lobby** voice channel and **type** `!queue`\n\n**Players in queue:     " + (i+1) + ' / 12**' + '\n' + playerList));
							i++;
						}
						else if(i = test) {

							playerList += '\n' + player[i].toString();
							mainMessage.edit(("To enter in queue **join PUG Lobby** voice channel and **type** `!queue`\n\n**Players in queue:     " + (i+1) + ' / 12**' + '\n' + playerList + '\n\n **Queue is full and a game is ready, wait for this game to finish before queueing up**'));
							full = true;
							pickNumber = 1;
							captainSelect();
						}
					}
				}
				else console.log('not in voice');
				msg.delete();
			}
			else {
				msg.delete();
			}
	    }


		// if(msg.content.startsWith('log')) {
		// 	console.log(msg.member.roles.has(pugMod.id));
		// 	console.log(msg.member.voiceChannelID);
		// 	console.log(voiceLobby.id);
		// 	msg.delete();
		// }

		if(full) {

			//Pick phase 1-2-2-2-2-1 like draft pick
			if((pickNumber < 2 || 3 < pickNumber < 6 || 7 < pickNumber < 10) && msg.member == team1Cap) {
				if(player.filter(f => f === msg.mentions.members.first()).length > 0) {
					var index = player.indexOf(msg.mentions.members.first());
					team1.push(player[index]);
					team1Text += '\n' + player[index].toString();
					player.splice(index, 1);
					pick();
				}
			}
			else if((1 < pickNumber < 4 || 5 < picknumber < 8) && msg.member == team2Cap) {
				if(player.filter(f => f === msg.mentions.members.first()).length > 0) {
					var index = player.indexOf(msg.mentions.members.first());
					team2.push(player[index]);
					team2Text += '\n' + player[index].toString();
					player.splice(index, 1);
					pick();
				}
			}
			msg.delete();
		}

	}

});


function restart() {
	mainMessage.edit("To enter in queue **join PUG Lobby** voice channel and **type** `!queue`");
	player = [];
	team1 = [];
	team2 = [];
	team1Cap = undefined;
	team2Cap = undefined;
	team1Text = '';
	team2Text = '';
	full = false;
	updatePlayerList();
	i = 0;
	console.log('restarted!');
}


//Edits message as players get picked
function pick() {

	if(pickNumber == 9) {

		team2.push(player[0]);
		team2Text += '\n' + player[0].toString();
		player.shift();


		mainMessage.edit("**Remember that one of the captains has to input `!end` when the game finishes**\n\n**Team 1:**\n" + team1Text + '\n\n' + "**Team 2:\n===>**" + team2Text);
		return moveChannel();
	}
	else if(pickNumber == 1 || pickNumber == 2 || pickNumber == 5 || pickNumber == 6 || pickNumber == 9) {
		updatePlayerList();
		mainMessage.edit("**Team 1:**\n" + team1Text + '\n\n' + "**Team 2:\n===>**" + team2Text + '\n\n\n' + '**Free Agents:\n**' + playerList);
		return pickNumber++;
	}
	else {
		updatePlayerList();
		mainMessage.edit("**Team 1:\n===>**" + team1Text + '\n\n' + "**Team 2:**\n" + team2Text + '\n\n\n' + '**Free Agents:\n**' + playerList);
		return pickNumber++;
	}
}




//When teams are picked move people to respective voice channels
function moveChannel() {
	team1.forEach(function(player) {
		if(player.voiceChannelID == voiceLobby.id) player.setVoiceChannel(voiceTeam1);
	});
	team2.forEach(function(player) {
		if(player.voiceChannelID == voiceLobby.id) player.setVoiceChannel(voiceTeam2);
	});
}





//Set the captains and remove them from the player array and playerList
function captainSelect() {
	let a = getRandomInt();
	 	b = getRandomInt2();

	team1Cap = player[a];
	team1.push(player[a]);
	player.splice(a, 1);
	team1Text += team1[0].toString();

	team2Cap = player[b];
	team2.push(player[b]);
	player.splice(b, 1);
	team2Text += team2[0].toString();

	updatePlayerList();

	return mainMessage.edit("**Team 1:\n===**>" + team1Text + '\n\n' + "**Team 2:**\n" + team2Text + '\n\n\n' + '**Free Agents:\n**' + playerList);

}





//Updates player list from the modified player array
function updatePlayerList() {
	playerList = '';
	for(let i = 0; i < player.length; i++) {
		playerList += '\n' + player[i].toString();
	}
	return playerList;
}



//Gets a random integer between two numbers
function getRandomInt() {
    return Math.floor(Math.random() * (test - 0 + 1));
}
function getRandomInt2() {
    return Math.floor(Math.random() * ((test - 1) - 0 + 1));
}
