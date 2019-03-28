import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import User from '../models/user.relational';
import {server} from "../src/server";

chai.use(chaiHttp);

describe('User', () => {

	it('exists', () => {
		expect(User).to.exist;
	});

	describe('POST /user', () => {
		it('should error with no first name', (done) => {
			chai.request(server)
				.post("/user")
				.send({lastName: "Smith", email: "jsmith@gmail.com", password: "*asdjqwejWDnd"})
				.end((err, res) => {
					expect(res.body.code).to.equal("invalidRequest");
					done();
				});
		});

		it('should error with no last name', (done) => {
			chai.request(server)
				.post("/user")
				.send({firstName: "John", email: "jsmith@gmail.com", password: "*asdjqwejWDnd"})
				.end((err, res) => {
					expect(res.body.code).to.equal("invalidRequest");
					done();
				});
		});

		it('should error with no email', (done) => {
			chai.request(server)
				.post("/user")
				.send({firstName: "John", lastName: "Smith", password: "*asdjqwejWDnd"})
				.end((err, res) => {
					expect(res.body.code).to.equal("invalidRequest");
					done();
				});
		});

		it('should error with no password', (done) => {
			chai.request(server)
				.post("/user")
				.send({firstName: "John", lastName: "Smith", email: "jsmith@gmail.com"})
				.end((err, res) => {
					expect(res.body.code).to.equal("invalidRequest");
					done();
				});
		});
	});

});
