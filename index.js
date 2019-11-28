const express = require('express')
const cors = require('cors')
const formidable = require('express-formidable');
const fs = require('fs')
const path = require('path')

const app = express()

app.use(formidable());
app.use(cors({
	origin: 'http://s.overhash.net'
}));

function makeid(length) {
	let result           = '';
	const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

app.post('/', (req, res) => {
	console.log(req.fields)
	let shortLink = req.fields.shortLink
	const longLink = req.fields.longLink

	const shortlinksUsedList = JSON.parse(fs.readFileSync('/var/www/html/s.overhash.net/public_html/shortlinksUsed.json', 'utf-8'))

	if (shortLink === '' || !shortLink) {
		shortLink = makeid(5);
	}

	if (!shortLink && !longLink) {
		res.json({
			statusCode: 404,
			shortURL: ``,
			errorMessage: `There was an error processing your request. Please try again`
		})
	}

	if (shortlinksUsedList[shortLink]) {
		console.log('Short link in use')
		res.json({
			statusCode: 400,
			shortURL: ``,
			errorMessage: `This short link is already in use! Please try a different short link.`
		})
		res.end()
		return null;
	}

	if (shortLink.length > 18) {
		console.log('Short link is too long')
		res.json({
			statusCode: 400,
			shortURL: ``,
			errorMessage: `The short link is too long! Ensure that short links are no more than 18 characters`
		})
		res.end()
		return null;
	}

	if (longLink.length > 512) {

	}

	fs.appendFile('/var/www/html/s.overhash.net/public_html/shortlinks.txt', shortLink + ' ' + longLink + '\n', (err) => {
		if (err) throw err;

		console.log('created short link with code ' + shortLink);
		res.json({
			statusCode: 200,
			shortURL: `http://s.overhash.net/${shortLink}`,
			errorMessage: ''
		})
		res.end()
	})

	shortlinksUsedList[shortLink] = longLink

	fs.writeFile('/var/www/html/s.overhash.net/public_html/shortlinksUsed.json', JSON.stringify(shortlinksUsedList, null, 4), () => {})
})

const keys = [
	'exampleKeyForTestingPurposes'
]

app.get('/pullTycoonSource', (req, res) => {
	if (!req.headers.key) return res.json({
		status: 400,
		message: 'No key provided',
		source: fs.readFileSync(path.join(__dirname, 'noKeyProvidedSource.txt'), {encoding: 'utf-8'})
	})
	if (!(new Set(keys).has(req.headers.key))) return res.json({
			status: 400,
			message: 'Key provided is not licensed.',
			source: fs.readFileSync(path.join(__dirname, 'invalidKeySource.txt'), {encoding: 'utf-8'})
		})
	console.log(`Request from ${req.headers['roblox-id']}!`);

	return res.json([
		'hello'
	])
})

app.listen('8880', () => console.log('Running!'))