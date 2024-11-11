import { run } from './config/database.config';
import initModule from './modules/init.module';

// configure
run();

// initialize modules
initModule.initModules();
