import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import User from '../models/user.relational';
import {server} from "../src/server";
import Campaign from '../models/campaign.relational';

chai.use(chaiHttp);

describe('Campaign', () => {

	it('exists', () => {
		expect(Campaign).to.exist;
	});

	describe('POST /campaigns/:id/submission', () => {
		it('should error with an invalid campaign id', (done) => {
			chai.request(server)
				.post("/campaigns/999999999/submission")
				.send({})
				.end((err, res) => {
					expect(res.body.code).to.equal("campaignDoesNotExist");
					done();
				});
		});
	});

});
