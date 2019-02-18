const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());
server.use(helmet());

server.post('/api/cohorts', (req, res) => {
    const cohort = req.body;
    if (!cohort.name) {
      res.status(500).json({error: "Please provide a name."});
    } else {
      db.insert(cohort)
      .into('cohorts')
      .then(ids => {
        res.status(201).json(ids[0]);
      })
      .catch(err => {
        res.status(500).json({error: "Failed to post to db."});
      })
    }
  })

const port = 3300;
server.listen(port, function() {
    console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
