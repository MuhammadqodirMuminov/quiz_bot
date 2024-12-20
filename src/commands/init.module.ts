import adminModule from './admin.module';
import adsModule from './ads.module';
import helpModule from './help.module';
import startModule from './start.module';
import subscibeModule from './subscibe.module';
import testModule from './test.module';
import userModule from './user.module';

class InitModule {
	initModules() {
		const allModules = [
			startModule,
			adminModule,
			testModule,
			helpModule,
			userModule,
			adsModule,
			subscibeModule,
		];
		allModules.forEach(module => module.init());
	}
}

export default new InitModule();
