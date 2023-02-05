import { IConfig } from "./interfaces"

export async function checkResourcesOk(config: IConfig) {
    for (const serverConfig of (config.servers instanceof Array ? config.servers : [config.servers])) {
        if (serverConfig.spammers.length === 0)
            throw new Error("You need to specify at least 1 spammer by server.\nServer '"+serverConfig.id+"' has nothing spammer")

        await Promise.all(
            serverConfig.spammers.map(spammer => spammer.connect())
        )
        for (const spammer of serverConfig.spammers) {
            for (const textChannelId of (serverConfig.textChannelIds??[])) {
                await spammer.fetchTextChannel(serverConfig.id,textChannelId)
            }
            for (const voiceChannelId of (serverConfig.voiceChannelIds??[])) {
                await spammer.fetchVoiceChannel(serverConfig.id,voiceChannelId)
            }
        }
    }
}

export function rateSpammerChecker(config: IConfig): number[] {
    if (config.nbVocalConnections === undefined && config.vocalsDuration !== undefined)
        throw new Error("'vocalDurations' can't be declared without 'nbVocalConnections'");

    

    const nbVocalsByServer = config.nbVocalConnections !== undefined ?
                                config.servers instanceof Array ?
                                    Math.floor(config.nbVocalConnections/config.servers.length) :
                                    config.nbVocalConnections :
                                null;

    return (config.servers instanceof Array ? config.servers : [config.servers])
        .map(serverConfig => {
            if (config.nbMessages !== undefined && (serverConfig.textChannelIds === undefined || serverConfig.textChannelIds.length === 0)) {
                throw new Error("Server '"+serverConfig.id+"' has nothing text channel whereas you have defined 'nbMessages'");
            }

            if (config.nbVocalConnections === undefined || config.vocalsDuration === undefined)
                return 0;
            

            if (serverConfig.voiceChannelIds === undefined || serverConfig.voiceChannelIds.length === 0) {
                throw new Error("Server '"+serverConfig.id+"' has nothing voice channel whereas you have defined 'nbVocalConnections'");
            }
    
            const nbCouples = Math.floor(serverConfig.spammers.length/2) + (serverConfig.spammers.length%2 === 0 ? 0 : 1)
    
            const nbSimultaneousVocals = Math.floor(<number>nbVocalsByServer/Math.min(serverConfig.voiceChannelIds.length,nbCouples));
    
            const maxVocalDuration = Math.floor(config.duration/nbSimultaneousVocals);
    
            if (<number>config.vocalsDuration <= maxVocalDuration) {
                return nbSimultaneousVocals;
            }
    
            const h = Math.floor(maxVocalDuration/(60*60*1000));
            const m = Math.floor(maxVocalDuration/(60*1000)) % 60;
            const s = Math.floor(maxVocalDuration/1000) % 60;
            const ms = maxVocalDuration % 1000
            throw new Error("You can't exceed "+Object.entries({h,m,s,ms})
                .filter(([_,v]) => v > 0).map(([u,v]) => v+u).join("")
            + " for vocal duration on server '"+serverConfig.id+"'")
        })
}