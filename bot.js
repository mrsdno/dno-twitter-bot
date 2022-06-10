require("dotenv").config();
const fs = require('fs');
const path = require('path');
const paramsPath = path.join(__dirname, 'params.json');
const twit = require("twit");
require("dotenv").config();

const params = process.env;

// pass the consumer and access tokens to twit
var Twitter = new twit(params);

function writeParams(data) {
    console.log('We are writing the params file', data)
    return fs.writeFileSync(paramsPath, JSON.stringify(data));
}

function readParams() {
    console.log("We are reading the params file");
    const data = fs.readFileSync(paramsPath);
    return JSON.parse(data.toString());
}

function getTweets(since_id) {
    return new Promise((resolve, reject) => {
        let params = {
          // feed the value to search for to retweet, can be # or @
          q: "from:abc #January6thCommitteeHearings",
        };
        if (since_id) {
            params.since_id = since_id;
        }
        console.log('We are gettigng the tweets...', params)
        Twitter.get('search/tweets', params, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        })
    })
}

function postRetweet(id) {
    return new Promise((resolve, reject) => {
        let params = {
            id,
        };
        Twitter.post('statuses/retweet/:id', params, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        })
    })
}

async function main() {
    try {
        const params = readParams();
        const data = await getTweets(params.since_id);
        const tweets = data.statuses;
        console.log('We got the tweets', tweets.length);

        for await (let tweet of tweets) {
            try { 
                await postRetweet(tweet.id_str)
                console.log('successful rewteet' + tweet.id_str)
            }
            catch (e) {
                console.log('unsuccessful retweet' + tweet.id_str)
            }
            params.since_id = tweet.id_str;
        }
        writeParams(params);
    } catch (e) {
        console.log(e);
    }
}

console.log('starting the twitter bot')
setInterval(main, 10000)