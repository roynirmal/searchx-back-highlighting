'use strict';

const mongoose = require('mongoose');
const Highlight = mongoose.model('Highlight');
// const Exclude = mongoose.model('Exclude');
const Page = mongoose.model('Page');
////

exports.addHighlight = async function(sessionId, data) {
    const Type = Highlight;
    // console.log("Highlight", data)
    data.sessionId = sessionId;
    const doc = await Type.findOne({
        url: data.url,
        sessionId: data.sessionId
    });

    if (!doc) {
        const now = new Date();
        data.created = now;
        data.date = now;
        const cont =  await Page
        .find({url: data.url}, {url:1, html:1})
        .sort({created: 1});
        // console.log("CONT", cont)
        data.text = cont[0].html
        // console.log("Er", data.text)
        const B = new Type(data);
        B.save();
        return;
    }

    if (doc.deleted === true) {
        doc.userId = data.userId;
        doc.deleted = false;
        doc.date = new Date();
        doc.save();
    }
};

exports.removeHighlight = async function(sessionId, url) {
    const Type =  Highlight;

    const doc = await Type.findOne({
        url: url,
        sessionId: sessionId
    });

    if (!doc) {
        throw new Error('Highlight does not exist');
    }

    doc.starred = false;
    doc.deleted = true;
    doc.save();
};

exports.starHighlight = async function(sessionId, url) {
    const doc = await Highlight.findOne({
        url: url,
        sessionId: sessionId
    });

    if (!doc) {
        throw new Error('Highlight does not exist');
    }

    doc.starred = !doc.starred;
    doc.save();
};

////

exports.getHighlights = async function(sessionId) {
    const Type =  Highlight;

    return await Type
        .find(
            {sessionId: sessionId, deleted: false},
            {url:1, title: 1, date: 1, userId: 1, starred: 1, text:1, _id: 0}
        )
        .sort({date: 1});
};

exports.getUserHighlights = async function(sessionId, userId) {
    return await Highlight
        .find(
            {sessionId: sessionId, userId: userId, deleted: false},
            {url:1, title: 1, date: 1, userId: 1, starred: 1, text:1, _id: 0}
        )
        .sort({date: 1});
};

exports.getHighlight = async function(sessionId, url) {
    const Type = Highlight;

    const query = {
        sessionId: sessionId,
        url: url,
        deleted: false
    };

    const docs = await Type.find(query, {date: 1, userId: 1, starred: 1, _id: 0});
    if (docs.length !== 0) {
        return docs[0];
    }

    return null;
};