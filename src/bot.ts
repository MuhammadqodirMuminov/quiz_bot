import { run } from './config/database.config';
import initModule from './commands/init.module';

// configure
run();

// initialize modules
initModule.initModules();
