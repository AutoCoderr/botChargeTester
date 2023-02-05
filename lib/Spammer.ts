import Discord, { Guild, TextChannel, VoiceChannel, ChannelType } from "discord.js";
import crypto from "crypto"
import {VoiceConnection, joinVoiceChannel} from '@discordjs/voice';

const loremIpsumBase = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, "+
                       "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "+
                       "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris "+
                       "nisi ut aliquip ex ea commodo consequat. "+
                       "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "+
                       "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

export default class Spammer {
    token: string;
    hashedToken: string;
    client: Discord.Client;

    guildsById: {[id: string]: Guild} = {};
    textChannelsById: {[id: string]: TextChannel} = {};
    voiceChannelsById: {[id: string]: VoiceChannel} = {};

    constructor(token: string) {
        this.token = token;

        const hasher = crypto.createHash('md5');
        hasher.update(this.token);

        this.hashedToken = hasher.digest('hex');

        this.client = new Discord.Client({
            intents: []
        });
    }

    getGuild(id: string): Guild {
        if (this.guildsById[id] === undefined) {
            const guild = this.client.guilds.cache.get(id);
            if (guild === undefined)
                throw new Error(`Guild '${id}' is not accessible from the bot '${this.client.user?.username}'`)
            this.guildsById[id] = guild;
        }
        return this.guildsById[id];
    }

    async fetchChannel
        <IType extends 'text'|'voice'>
        (guildId: string, channelId: string, type: IType): Promise<void> {
            const guild = this.getGuild(guildId);

            const channelsById = type === "text" ? this.textChannelsById : this.voiceChannelsById;

            if (channelsById[channelId] !== undefined)
                return
        
            const channel = await guild.channels.fetch(channelId).catch(() => null);
            const wantedType = type === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice;
            
            if (channel === null || channel.type !== wantedType)
                throw new Error(`The ${type} channel '${channelId}' on the guild '${guildId}' is not accessible from the bot '${this.client.user?.username}'`)
            channelsById[channelId] = channel;
    }

    fetchTextChannel(guildId: string, channelId: string) {
        return this.fetchChannel(guildId, channelId, 'text')
    }
    fetchVoiceChannel(guildId: string, channelId: string) {
        return this.fetchChannel(guildId, channelId, 'voice')
    }

    sendMessage(channelId: string, length = 50) {
        let msg = "";
        for (let i=0;i<Math.floor(length/loremIpsumBase.length);i++) {
            msg += loremIpsumBase;
        }
        msg += loremIpsumBase.substring(0,length%loremIpsumBase.length);

        return this.textChannelsById[channelId].send(msg);
    }

    createVoiceConnection(channelId: string, selfMute = false, selfDeaf = false): VoiceConnection {
        return joinVoiceChannel({
            channelId: channelId,
            guildId: this.voiceChannelsById[channelId].guildId,
            adapterCreator: this.voiceChannelsById[channelId].guild.voiceAdapterCreator,
            group: this.hashedToken,
            selfDeaf,
            selfMute
        })
    }

    connect() {
        this.client.login(this.token);

        return new Promise(resolve =>
            this.client.on('ready', resolve)    
        )
    }
}