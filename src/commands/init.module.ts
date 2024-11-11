import adminModule from './admin.module';
import startModule from './start.module';

class InitModule {
	initModules() {
		const allModules = [startModule, adminModule];
		allModules.forEach(module => module.init());
	}
}

export default new InitModule();
