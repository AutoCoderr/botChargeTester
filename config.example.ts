import { IConfig } from "./lib/interfaces";
import Spammer from "./lib/Spammer";

const config: IConfig = {
    duration: 16 * 1000,
    nbMessages: 16,
    nbVocalConnections: 64,
    vocalsDuration: 500,
    servers: [
        {
            id: "server_id",
            textChannelIds: ['text_channel_id_1','text_channel_2'],
            voiceChannelIds: ['vocal_channel_id_1','text_vocal_2'],

            spammers: [
                "spammer_1_token",
                "spammer_2_token",
                "spammer_3_token",
                "spammer_4_token"
            ].map(token => new Spammer(token))
        }
    ]
}

export default config;