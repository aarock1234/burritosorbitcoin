require('console-stamp')(console, { pattern: 'HH:MM:ss.l' });

Array.prototype.remove = function () {
	var what,
		a = arguments,
		L = a.length,
		ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

const fs = require('fs');
const faker = require('faker');
const request = require('request-promise');
const cheerio = require('cheerio');

const proxies = [];
const config = require('./config.json');
fs.readFileSync(__dirname + '/proxies.txt', 'utf-8')
	.split(/\r?\n/)
	.forEach((line) => proxies.push(line));

class Task {
	constructor(props) {
		this.id = props.id;
		this.firstName = faker.name.firstName();
		this.lastName = faker.name.lastName();
		this.email =
			this.firstName + this.lastName + faker.random.alphaNumeric(10) + '@' + config.catchall;

		if (!proxies.length) {
			console.error(`(ID ${this.id}) Out of Proxies!`);
			process.exit(1);
		}
		this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
		this.proxy = this.formatProxy(this.rawProxy);
		this.jar = request.jar();

		this.submitCustomer();
	}
	sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}
	formatProxy(proxy) {
		if (!proxy || proxy.replace(/\s/g, '') == '') return null;

		let proxySplit = proxy.split(':');

		if (proxySplit.length > 2) {
			return (
				'http://' +
				proxySplit[2] +
				':' +
				proxySplit[3] +
				'@' +
				proxySplit[0] +
				':' +
				proxySplit[1]
			);
		} else {
			return 'http://' + proxySplit[0] + ':' + proxySplit[1];
		}
	}
	async getQueso() {
		try {
			const response = await request({
				url: 'https://burritosorbitcoin.com/alreadyentered',
				method: 'GET',
				headers: {
					accept:
						'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
					'accept-encoding': 'gzip, deflate, br',
					'accept-language': 'en-US,en;q=0.9',
					'cache-control': 'no-cache',
					pragma: 'no-cache',
					referer: 'https://burritosorbitcoin.com/',
					'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
					'sec-ch-ua-mobile': '?0',
					'sec-fetch-dest': 'document',
					'sec-fetch-mode': 'navigate',
					'sec-fetch-site': 'same-origin',
					'sec-fetch-user': '?1',
					'upgrade-insecure-requests': 1,
					'user-agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
				},
				proxy: this.proxy,
				jar: this.jar,
				gzip: true,
				resolveWithFullResponse: true,
				followAllRedirects: true,
			});
            const $ = cheerio.load(response.body);
            const code = $('#AlreadyEntered > div > div > div > div:nth-child(1) > div > h2:nth-child(1) > strong').text();
			console.log(`(ID ${this.id}) Successfully Got Queso > ${code}`);
            this.jar = request.jar();
            this.firstName = faker.name.firstName();
            this.lastName = faker.name.lastName();
            this.email =
                this.firstName + this.lastName + faker.random.alphaNumeric(10) + '@' + config.catchall;
            return this.submitCustomer();
		} catch (error) {
			proxies.remove(this.rawProxy);
			this.jar = request.jar();
			if (!proxies.length) {
				console.error(`(ID ${this.id}) Out of Proxies!`);
				process.exit(1);
			}
			this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
			this.proxy = this.formatProxy(this.rawProxy);
			console.error(`(ID ${this.id}) Error Getting Queso > ${error.message}`);
			await this.sleep(1000);
			return this.getQueso();
		}
	}
	async submitCustomer() {
		try {
			console.log(`(ID ${this.id}) Created Customer > ${this.firstName} ${this.lastName}`);

			const response = await request({
				url: 'https://burritosorbitcoin.com/ajax/landing',
				method: 'POST',
				headers: {
					accept: '*/*',
					'accept-encoding': 'gzip, deflate, br',
					'accept-language': 'en-US,en;q=0.9',
					'cache-control': 'no-cache',
					'content-type':
						'multipart/form-data; boundary=----WebKitFormBoundaryTeArtg070usDYUGj',
					origin: 'https://burritosorbitcoin.com',
					pragma: 'no-cache',
					referer: 'https://burritosorbitcoin.com/',
					'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
					'sec-ch-ua-mobile': '?0',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-origin',
					'user-agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
					'x-requested-with': 'XMLHttpRequest',
				},
				proxy: this.proxy,
				jar: this.jar,
				gzip: true,
				resolveWithFullResponse: true,
				followAllRedirects: true,
				form: {
					first_name: this.firstName,
					last_name: this.lastName,
					email: this.email,
					optin_rules: 'yes',
				},
			});

			console.log(`(ID ${this.id}) Successfully Submit Customer > ${response.statusCode}`);
			return this.submitGuess();
		} catch (error) {
			proxies.remove(this.rawProxy);
			this.jar = request.jar();
			this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
			this.proxy = this.formatProxy(this.rawProxy);
			if (!proxies.length) {
				console.error(`(ID ${this.id}) Out of Proxies!`);
				process.exit(1);
			}
			console.error(`(ID ${this.id}) Error Submitting Customer > ${error.message}`);
			await this.sleep(1000);
			return this.submitCustomer();
		}
	}
	async submitGuess() {
		try {
			const code = Math.floor(100000 + Math.random() * 900000);
			const response = await request({
				url: 'https://burritosorbitcoin.com/ajax/play',
				method: 'POST',
				headers: {
					accept: '*/*',
					'accept-encoding': 'gzip, deflate, br',
					'accept-language': 'en-US,en;q=0.9',
					'cache-control': 'no-cache',
					'content-type':
						'multipart/form-data; boundary=----WebKitFormBoundaryTeArtg070usDYUGj',
					origin: 'https://burritosorbitcoin.com',
					pragma: 'no-cache',
					referer: 'https://burritosorbitcoin.com/',
					'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
					'sec-ch-ua-mobile': '?0',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-origin',
					'user-agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
					'x-requested-with': 'XMLHttpRequest',
				},
				proxy: this.proxy,
				jar: this.jar,
				gzip: true,
				resolveWithFullResponse: true,
				followAllRedirects: true,
				form: {
					code,
				},
				json: true,
			});

			if (response.body.winner) {
				console.log(`(ID ${this.id}) Winner > ${code} - ${this.email}`);
			} else if (response.body.navigate) {
				console.log(`(ID ${this.id}) Out of Tries > ${code}`);
				return this.getQueso(); // Can't submit another code on finish
			} else {
				console.log(`(ID ${this.id}) Loser > ${code}`);
				return this.submitGuess();
			}
		} catch (error) {
			proxies.remove(this.rawProxy);
			this.jar = request.jar();
			this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
			this.proxy = this.formatProxy(this.rawProxy);
			if (!proxies.length) {
				console.error(`(ID ${this.id}) Out of Proxies!`);
				process.exit(1);
			}
			console.error(`(ID ${this.id}) Error Submitting Code > ${error.message}`);
			await this.sleep(1000);
			return this.submitCustomer(); // Can't submit another code on datadome blockage
		}
	}
}

for (let i = 0; i < config.tasks; i++) {
	new Task({ id: i + 1 });
}
