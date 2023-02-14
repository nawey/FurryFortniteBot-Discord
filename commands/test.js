const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder} = require('discord.js');
const fs = require ('node:fs');
const path = require ('node:path');

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

//  fs.createReadStream(skinsPath)
//fs.createReadStream(emotesPath));
module.exports = {
    data: new SlashCommandBuilder()
    .setName('itemshop')
    .setDescription('Send info of current shop'),
async execute (interaction){
    await interaction
    .reply({ embeds: [embSkins, embEmotes], files: [streamSk, streamEm]}
    )
}
};
