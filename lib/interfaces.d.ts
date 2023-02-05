import Spammer from "./Spammer";

interface IServerConfig {
    id: string;
    voiceChannelIds?: string[];
    textChannelIds?: string[];
    spammers: Spammer[];
}

interface IConfig {
    duration: number;

    nbMessages?: number;

    nbVocalConnections?: number;
    vocalsDuration?: number;

    servers: IServerConfig|IServerConfig[]
}