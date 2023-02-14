require('dotenv').config()
const fs = require ('node:fs');
const path = require ('node:path');
const { Client, Collection, Events, GatewayIntentBits, AttachmentBuilder, EmbedBuilder, BaseGuildTextChannel, ChannelType, messageLink } = require ('discord.js');
const { token } = require('./auth.json');
var schedule = require('node-schedule');
const { send } = require('node:process');
const { channel } = require('node:diagnostics_channel');

const client = new Client ({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const getMostRecentFile = (dir) => {
    const files = orderReccentFiles(dir);
    return files.length ? files[0] : undefined;
  };
const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
      .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
      .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  };

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once (Events.ClientReady, c => {
    
    console.log (`Ready! Logged in as ${c.user.tag}`);
});

//create channel when joining a server
client.on (Events.GuildCreate, guild => 
	{
		guild.channels.create ({
			name: "fortnite-furry-bot",
			type: ChannelType.GuildText,
			topic: "The Fortnite Furry Bot will post the new shop every day at reset in this channel",
		});

});

client.login(token);

//commands
client.on (Events.InteractionCreate, interaction => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

//daily message with itemshop
schedule.scheduleJob('15 18 * * *', async function(){
	console.log("preparing daily message")
	const furryshoptoday = getMostRecentFile("/home/gamas/FNItemShopGenerator/ItemShopDaily");
  const furryemotestoday = getMostRecentFile("/home/gamas/FNItemShopGenerator/ItemShopEmotes");
  const skinsPath = path.join('/home/gamas/FNItemShopGenerator/ItemShopDaily/' + furryshoptoday.file);
  const emotesPath = path.join('/home/gamas/FNItemShopGenerator/ItemShopEmotes/' + furryemotestoday.file);
  
  const status = "These are the furry cosmetics and emotes that are available today on the Item shop! \n\nUse code FURRYBAIT in the Item Shop to support us! \n#EpicPartner #FurryFortnite";
  const streamSk = new AttachmentBuilder (skinsPath);
  const streamEm = new AttachmentBuilder (emotesPath);

  const embSkins = new EmbedBuilder()
  .setTitle(status)
  .setURL('https://twitter.com/furry_fortnite')
  .setImage('attachment:/'+skinsPath);

  const embEmotes = new EmbedBuilder()
  .setTitle(status)
  .setURL('https://twitter.com/furry_fortnite')
  .setImage('attachment:/'+emotesPath);

  const link = new EmbedBuilder()
  .setURL('https://twitter.com/furry_fortnite')

	console.log("deleting previous message")

	client.guilds.cache.forEach(guild => {
		const channel = guild.channels.cache.find(channel => channel.name === "fortnite-furry-bot")
	console.log('deleting last message from server'+ "\n")
	channel.bulkDelete(5)
	.then(messages => console.log(`Bulk deleted ${messages.size} messages`))
	.catch(console.error);
	})

	console.log("runnning daily message")

	client.guilds.cache.forEach(guild => {
		const channel = guild.channels.cache.find(channel => channel.name === "fortnite-furry-bot")
	console.log('sending message to  server'+ "\n")
	channel.send ({
		embeds: [embSkins, embEmotes], files: [streamSk, streamEm]
	})	
	})
	
});

