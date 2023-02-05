import {checkResourcesOk, rateSpammerChecker} from "./lib/checkers";
import config from "./config";
import executeChargeTester from "./lib/executeChargerTester";

(async () => {
    try {
        const nbSimultaneousVocalsByServers = rateSpammerChecker(config);
        await checkResourcesOk(config);

        console.log("Spamming ...")

        const date = new Date();

        await executeChargeTester(config,nbSimultaneousVocalsByServers);

        console.log("Spams finished in "+((new Date().getTime() - date.getTime())/1000)+"s")
    } catch(e) {
        console.error(e)
    }
    process.exit();
})()