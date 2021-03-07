const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Set response
const setResponse = (username, repos) => {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

// Make request to Github for data
/*
async function getRepos(req, res, next) {
  try{
    console.log('Fetching Data...');

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users${username}`);
    
    const data = await response.json();

    const repos = data.public_repos;

    // Set data to Redis
    client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  }catch(err){
    console.error(err);
    res.status(500);
  }
}*/
async function getRepos(req, res, next) { 
    console.log('Fetching Data...'); 
    const { username } = req.params; 
    fetch(`https://api.github.com/id/${username}`)
    .then(response => { response.json(); 
        const repos = data.public_repos; 
        client.setex(username, 3600, repos); 
        return res.send(setResponse(username, repos)); 
    }).catch((err) => { 
        res.status(500).json({ 
            status:'failed', message: err 
        }); 
    }) 
}

// Cache middleware
const check_cache = (req, res, next) => {
  const { username } = req.params;

  client.get(username, (err, data) => {
    if (err) throw err;

    if (!data) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get('/repos/:username', check_cache, getRepos);

app.listen(PORT, () => {
  console.log(`Server listning on port: ${PORT}`);
});