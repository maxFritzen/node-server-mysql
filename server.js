import 'dotenv/config'
const express = require('express')
const app = express()
const port = 3000

const mysql = require('mysql')
const helmet = require('helmet');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});

db.connect();


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(helmet())
app.use(express.urlencoded({ extended: true }))

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

function jsDateToMySqlDatetime (date) {
  return new Date(date).toJSON().slice(0, 19).replace('T', ' ') 
}

app.get('/posts/:userId', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.params:', req.params)
  db.query(`SELECT * FROM posts WHERE by_user_id = (${req.params.userId})`, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})

app.get('/posts/:userId/:postId', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.params:', req.params)
  const { userId, postId } = req.params
  
  db.query(`SELECT * FROM posts 
    WHERE by_user_id = (${userId}) 
    AND id = (${postId}) `, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})

app.post('/posts/:userId', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.body:', req.body)
  const { userId } = req.params
  const { text, nextTimeToRead } = req.body
  // TODO: check size, so its not too big
  const next_time_to_read = jsDateToMySqlDatetime(nextTimeToRead)
  db.query(`
    INSERT INTO posts (text, created_at, next_time_to_read, by_user_id)
    VALUES ('${text}', now(), '${next_time_to_read}', ${userId})
  `, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})

app.put('/posts/:userId/:postId/text', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.body:', req.body)
  const { userId, postId } = req.params
  const { text } = req.body

  db.query(`
    UPDATE posts 
    SET text = '${text}' 
    WHERE id = ${postId} AND by_user_id = ${userId};
  `, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})

app.put('/posts/:userId/:postId/markasread', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.body:', req.body)
  const { userId, postId } = req.params
  const { nextTimeToRead } = req.body
  const next_time_to_read = jsDateToMySqlDatetime(nextTimeToRead)

  db.query(`
    UPDATE posts 
    SET next_time_to_read = '${next_time_to_read}' 
    WHERE id = ${postId} AND by_user_id = ${userId};
  `, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})

app.put('/posts/:userId/:postId/markasread', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.body:', req.body)
  const { userId, postId } = req.params
  const { nextTimeToRead } = req.body
  const next_time_to_read = jsDateToMySqlDatetime(nextTimeToRead)

  db.query(`
    UPDATE posts 
    SET next_time_to_read = '${next_time_to_read}' 
    WHERE id = ${postId} AND by_user_id = ${userId};
  `, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})

app.delete('/posts/:userId/:postId', (req, res) => {
  console.log('req.url:', req.url)
  console.log('req.body:', req.body)
  const { userId, postId } = req.params

  db.query(`
    DELETE FROM posts 
    WHERE id = ${postId} AND by_user_id = ${userId};
  `, function(err, result, fields) {
    if (err) throw err
    res.send(result)
  })
})
