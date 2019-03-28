import { expect } from 'chai';
import User from '../models/user.relational';

describe('User', () => {

	it('exists', () => {
		expect(User).to.exist;
	});

});
