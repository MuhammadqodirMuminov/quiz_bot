import startModule from './start.module';

class InitModule {
	initModules() {
		const allModules = [startModule];
		allModules.forEach(module => module.init());
	}
}

export default new InitModule();
