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

server.get('/api/cohorts', (req, res) => {
    db("cohorts")
    .then(cohorts => {
        res.status(200).json(cohorts);
    })
    .catch(err => {
        res.status(500).json({error: "Failed to get from db."})
    })
})

server.get('/api/cohorts/:id', (req,res) => {
    const id = req.params.id;
    db("cohorts").where("id", id)
    .then(cohort => {
        if (cohort.length < 1) {
            res.status(404).json({error: `ID ${id} does not exist in the db.`})
        } else {
            res.status(200).json(cohort);
        }
    })
    .catch(err => {
        res.status(500).json({error : "Could not GET from db."})
    })
})

server.get('/api/cohorts/:id/students', (req,res) => {
    const id = req.params.id;
    db("students").join('cohorts','students.cohort_id', "=", 'cohorts.id')
    .select("students.name","students.cohort_id","students.id").where("cohorts.id",id)
    .then(students => {
        res.status(200).json(students)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error:"Could not get students of cohort"})
    })
})

server.put("/api/cohorts/:id", (req, res) => {
    const id = req.params.id;
    const cohort = req.body;
    if (!cohort.name) {
      res.status(500).json({error: "Please provide a name."});
    } else {
      db("cohorts").where("id",id).update(cohort)
      .then(ids => {
        res.status(200).json({message: `Successfully updated cohort with ID ${id}`});
      })
      .catch(err => {
        res.status(500).json({error: "Failed to update db."});
      })
    }
})

server.delete("/api/cohorts/:id", (req, res) => {
    const id = req.params.id;
    db("cohorts").where("id", id).del()
    .then(success => {
        if (success) {
            res.status(200).json({message: `Successfully deleted cohort with ID ${id}`});
        } else {
            res.status(404).json({error: `ID ${id} does not exist in the db.`})
        }
    })
    .catch(err => {
        res.status(500).json({error : "Could not DELETE from db."})
    })
})

const port = 3300;
server.listen(port, function() {
    console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
