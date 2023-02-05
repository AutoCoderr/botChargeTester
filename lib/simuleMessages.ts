import { IServerConfig } from "./interfaces";
import { rand, sleep } from "./utils";

export default async function simuleMessages(serverConfig: IServerConfig, nbMessages: number, durationBetweenMessages: number) {
    for (let i=0;i<nbMessages;i++) {
        const textChannelId = (<string[]>serverConfig.textChannelIds)[rand(0,(<string[]>serverConfig.textChannelIds).length)]
        serverConfig.spammers[i%serverConfig.spammers.length].sendMessage(textChannelId);

        await sleep(durationBetweenMessages);
    }
}