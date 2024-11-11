import adminModule from './admin.module';
import helpModule from './help.module';
import startModule from './start.module';

class InitModule {
	initModules() {
		const allModules = [startModule, adminModule, helpModule];
		allModules.forEach((module) => module.init());
	}
}

export default new InitModule();
