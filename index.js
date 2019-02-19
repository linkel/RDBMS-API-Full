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
        if (ids) {
            res.status(200).json({message: `Successfully updated cohort with ID ${id}`});
        } else {
            res.status(404).json({error: `Student with ID ${id} does not exist!`})
        }
       
      })
      .catch(err => {
        res.status(500).json({error: "Failed to update db. Does your id exist?"});
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

// STUDENTS DB

server.post("/api/students", (req, res) => {
    const student = req.body
    if (!student.name || !student.cohort_id) {
        res.status(500).json({error: "Please provide both a name and a cohort_id for the student."});
      } else {
        db("students").insert(student) // I used different syntax here compared to the cohorts DB to compare
        .then(response => {
            res.status(201).json({message: "Successfully added new student."})
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Unable to post to students DB."})
        })

      }
})

server.get('/api/students', (req,res) => {
    db("students")
    .then(response => {
        res.status(200).json(response)
    })
    .catch(err => {
        res.status(500).json({error: "Could not GET from students db"})
    })
})

server.get('/api/students/:id', (req, res) => {
    const id = req.params.id;
    db("students").join("cohorts","students.cohort_id","=","cohorts.id")
    .select("students.id","students.name",(db.ref("cohorts.name").as("cohort"))).where("students.id", id)
    .then(student => {
        if (student.length < 1) {
            res.status(404).json({error: `Student with id ${id} does not exist!`})
        } else {
            res.status(200).json(student)
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: "Unable to get from students database"})
    })
});

server.put('/api/students/:id', (req, res) => {
    const id = req.params.id;
    const student = req.body;
    if (!student.name || !student.cohort_id) {
        res.status(500).json({error: "Please provide both a name and a cohort_id for the student."});
      } else {
        db("students").where("id",id).update(student)
        .then(response => {
            if (response) {
                res.status(200).json({message: `Successfully edited student with ID ${id}`})
            } else {
                res.status(404).json({error: `Student with ID ${id} does not exist.`})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Unable to update students DB."})
        })
      }
})

server.delete('/api/students/:id', (req, res) => {
    const id = req.params.id;
    db("students").where("id", id).del()
    .then(response => {
        if (response) {
            res.status(200).json({message: `Successfully deleted student with ID ${id}`})
        } else {
            res.status(404).json({error: `Student with ID ${id} does not exist!`})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: "Unable to DELETE from students db."})
    })
})

const port = 3300;
server.listen(port, function() {
    console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
