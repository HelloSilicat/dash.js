import FactoryMaker from '../../../core/FactoryMaker';
import Debug from '../../../core/Debug';
import SwitchRequest from '../SwitchRequest';

function CustomedRule() {
    const context = this.context;
    let instance,
        logger;

    const MAX_SWITCH = 0.075;
    const SAMPLE_SIZE = 6;

    function setup() {
        logger = Debug(context).getInstance().getLogger(instance);
    }

    function getMaxIndex(rulesContext) {
        const switchRequestHistory = rulesContext ? rulesContext.getSwitchHistory() : null;
        const switchRequests = switchRequestHistory ? switchRequestHistory.getSwitchRequests() : [];
        let drops = 0;
        let noDrops = 0;
        let dropSize = 0;
        const switchRequest = SwitchRequest(context).create();

        for (let i = 0; i < switchRequests.length; i++) {
            if (switchRequests[i] !== undefined) {
                drops += switchRequests[i].drops;
                noDrops += switchRequests[i].noDrops;
                dropSize += switchRequests[i].dropSize;

                if (drops + noDrops >= SAMPLE_SIZE && (drops / noDrops > MAX_SWITCH)) {
                    switchRequest.quality = (i > 0 && switchRequests[i].drops > 0) ? i - 1 : i;
                    switchRequest.reason = {index: switchRequest.quality, drops: drops, noDrops: noDrops, dropSize: dropSize};
                    logger.debug('Switch history rule index: ' + switchRequest.quality + ' samples: ' + (drops + noDrops) + ' drops: ' + drops);
                    break;
                }
            }
        }

        return switchRequest;
    }

    instance = {
        getMaxIndex: getMaxIndex
    };

    setup();

    return instance;
}


CustomedRule.__dashjs_factory_name = 'CustomedRule';
export default FactoryMaker.getClassFactory(CustomedRule);
