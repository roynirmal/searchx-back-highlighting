
'use strict';
const scrap = require('../../scrap');
const puppeteer = require('puppeteer');
const request = require('request');
const Readability = require("readability");
const JSDOM = require("jsdom").JSDOM;
const requestPromise = require("request-promise-native");
const BingApi = require('node-bing-api')({
    accKey: process.env.BING_ACCESS_KEY,
    rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"
});

/**
 * Fetch data from bing and return formatted results.
 */
exports.fetch = async function (query, vertical, pageNumber, resultsPerPage, relevanceFeedbackDocuments) {
    return new Promise(function (resolve, reject) {
        const callback = function (err, res, body) {
            if (err) return reject(err);

            const data = formatResults(vertical, body);
            resolve(data);
        };
        if ((resultsPerPage !== 12 && vertical === 'images') || (resultsPerPage !== 10 && vertical === 'web') || (resultsPerPage !== 12 && vertical === 'videos') || (resultsPerPage !== 10 && vertical === 'news')) {
            throw {name: 'Bad Request', message: 'Invalid number of results per page (Bing only supports a fixed number of results per page, and can therefore not support Distribution of Labour)'}
        }
        if (Array.isArray(relevanceFeedbackDocuments) && relevanceFeedbackDocuments.length > 0) {
            throw {name: 'Bad Request', message: 'The Bing search provider does not support relevance feedback, but got relevance feedback documents.'}
        }

        const options = constructOptions(vertical, pageNumber);
        if (vertical === 'web') BingApi.web(query, options, callback);
        else if (vertical === 'news') BingApi.news(query, options, callback);
        else if (vertical === 'images') BingApi.images(query, options, callback);
        else if (vertical === 'videos') BingApi.video(query, options, callback);
        else throw {name: 'Bad Request', message: 'Invalid vertical'}
    });
};

/**
 * Format result body received from search api call.
 */

const savePage = async function(url) {
    // const page = await waitForNewPage();
    // await page.goto(url, {waitUntil: 'networkidle2',  timeout: 100000});
    // await page.setViewport({width: 1360, height: 768});

    // const body = await page.content();
    // // var article = new Readability(body).parse();
    const body = await requestPromise(url);
    const doc = new JSDOM(body, {
        url: url,
    });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();


    // console.log("Body", article)
    // await page.close();

    ////
    return article
};

const formatResults= async function(vertical, body) {
    if (!body) {
        throw new Error('No response from bing api.');
    }

    if (!("value" in body || "webPages" in body)) {
        return {
            results: [],
            matches: 0
        };
    }

    ////

    if (vertical === 'web') {
        body = body.webPages
        for (let i = 0; i < body.value.length; i++) {
            const clean =  await savePage(body.value[i].url)
            // console.log(clean.content)
            body.value[i].text = clean.content
            // body.value[i].url = body.value[i].contentUrl;
        }
    }

    if (vertical === 'images' || vertical === 'videos') {
        for (let i = 0; i < body.value.length; i++) {
            body.value[i].url = body.value[i].contentUrl;
        }
    }
    
    
    return {
        results: await body.value.map(formatResult),
        // matches: body.totalEstimatedMatches
    };
}
function formatResult (result) {
    
    return {
        id: result.id,
        url: result.url,
        name: result.name,
        snippet: result.snippet,
        about: result.about,
        displayUrl: result.displayUrl,
        text: result.text
    }
}
/**
 * Construct search query options according to search api (bing).
 * https://www.npmjs.com/package/node-bing-api
 * https://docs.microsoft.com/en-us/azure/cognitive-services/bing-web-search/search-the-web
 */
function constructOptions(vertical, pageNumber) {
    const count = (vertical === 'images' || vertical === 'videos') ? 12 : 10;
    const mkt = 'en-US';
    const offset = (pageNumber - 1) * count;

    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
}
