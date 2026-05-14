const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const serverless = require('serverless-http');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB Data API (HTTP-based, no TCP connection, no cold-start lag)
const MONGO_CLUSTER = process.env.MONGO_CLUSTER || 'Cluster0';
const MONGO_API_URL = `https://data.mongodb-api.com/app/${process.env.MONGO_APP_ID}/endpoint/data/v1`;
const DB = 'fairride';

async function mongoRequest(action, collection, body = {}) {
  const res = await fetch(MONGO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.MONGO_API_KEY
    },
    body: JSON.stringify({
      dataSource: MONGO_CLUSTER,
      database: DB,
      collection,
      ...body
    }),
    // The action is encoded in the URL per the new Data API spec
  });
  if (!res.ok) throw new Error(`MongoDB error: ${res.statusText}`);
  return res.json();
}

module.exports = { mongoRequest };
