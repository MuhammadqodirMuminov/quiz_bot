import adminModule from './admin.module';
import helpModule from './help.module';
import startModule from './start.module';
import testModule from './test.module';

class InitModule {
	initModules() {
		const allModules = [startModule, adminModule, testModule, helpModule];
		allModules.forEach(module => module.init());
	}
}

export default new InitModule();
