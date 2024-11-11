import { connect } from 'mongoose';

export function run() {
	connect(process.env.MONGO_URI!, {})
		.then(() => console.log('MongoDB to connection successfully'))
		.catch(err => {
			console.error('MongoDB connection error:', err);
			process.exit(1);
		});
}
