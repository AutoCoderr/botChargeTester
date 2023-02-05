import Spammer from "./Spammer";
import { IConfig, IServerConfig } from "./interfaces";
import { VoiceConnection } from "@discordjs/voice";
import { rand, sleep } from "./utils";

function getRandomSpammerCouples(spammers: Spammer[], nbCouples: number) {
    const couples: [Spammer,null|Spammer][] = [];
    for (let i=0; i<nbCouples && spammers.length>0 ; i++) {
        const spammer1 = spammers[rand(0,spammers.length)]
        spammers = spammers.filter(({token}) => token !== spammer1.token);
        const spammer2 = spammers.length > 0 ? spammers[rand(0,spammers.length)] : null;
        spammers = spammer2 ? spammers.filter(({token}) => token !== spammer2.token) : spammers;
        couples.push([spammer1,spammer2]);
    }
    return couples;
}

export default async function simuleVoiceConnections(
    config: IConfig,
    serverConfig: IServerConfig,
    nbSimultaneousVocals: number
) {
    const maxVocalDuration = Math.floor(config.duration/nbSimultaneousVocals);
    const vocalDuration = config.vocalsDuration ?? maxVocalDuration;
    for (let i=0;i<nbSimultaneousVocals;i++) {
        const spammersCouples = getRandomSpammerCouples(serverConfig.spammers, (<string[]>serverConfig.voiceChannelIds).length);

        const connectionsCouples: ([VoiceConnection,null|VoiceConnection]|null)[] = (<string[]>serverConfig.voiceChannelIds).map((channelId,i) =>
            spammersCouples.length > i ? [
                spammersCouples[i][0].createVoiceConnection(channelId),
                spammersCouples[i][1] && (<Spammer>spammersCouples[i][1]).createVoiceConnection(channelId)
            ] : null
        )

        await sleep(vocalDuration);
        connectionsCouples.map(connectionCouple => 
            connectionCouple && connectionCouple.map(connection => 
                connection && connection.destroy()
            )
        )
        if (maxVocalDuration > vocalDuration)
            await sleep(maxVocalDuration - vocalDuration)
    }
}