import { IConfig } from "./interfaces";
import simuleMessages from "./simuleMessages";
import simuleVoiceConnections from "./simuleVoiceConnections";

export default function executeChargeTester(config: IConfig, nbSimultaneousVocalsByServers: number[]) {
    const nbMessagesByServer = config.nbMessages !== undefined ?
                                config.servers instanceof Array ? 
                                    Math.floor(config.nbMessages/config.servers.length) :
                                    config.nbMessages :
                                null;
    const durationBetweenMessages = nbMessagesByServer !== null ? Math.floor(config.duration/nbMessagesByServer) : null;
    
    return Promise.all(
        (config.servers instanceof Array ? config.servers : [config.servers])
            .map((serverConfig,i) => 
                Promise.all([
                    ...(
                        config.nbVocalConnections ? [simuleVoiceConnections(config, serverConfig, nbSimultaneousVocalsByServers[i])] : []
                    ),
                    ...(
                        config.nbMessages ? [simuleMessages(serverConfig, <number>nbMessagesByServer, <number>durationBetweenMessages)] : []
                    )
                ])
            )
    )
}