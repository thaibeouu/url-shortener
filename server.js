const express = require('express');
const http = require('http');
const {
  MongoClient,
} = require('mongodb');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');

const url = 'mongodb://mongo:27017';
// const url = 'mongodb://localhost:27017';
const app = express();

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 3001));

const server = http.createServer(app);
const io = socketIo(server);

io.origins('*:*');
io.on('connection', (socket) => {
  socket.emit('connection:sid', socket.id);
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/', express.static('client/build'));

app.get('/api', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    if (err) throw err;
    const db = client.db('tiki');
    db.collection('urls')
      .find().sort({
        visited: -1,
      }).limit(10)
      .toArray((err, docs) => {
        if (err) throw err;
        // console.log(docs);
        res.json(docs);
      });
  });
});

app.post('/api/new', (req, res) => {
  if (req.body.url) {
    MongoClient.connect(url, (err, client) => {
      if (err) throw err;
      const db = client.db('tiki');
      const collection = db.collection('urls');
      collection.findOne({
        url: req.body.url,
      }).then((doc) => {
        if (doc) {
          console.log('URL already exists.');
          res.send({
            url: doc.url,
            code: doc.code,
            status: 200,
            statusTxt: 'OK',
          });
        } else {
          const newUrl = {
            url: req.body.url,
            code: Math.random().toString(36).substr(2, 6),
            lastVisited: (Date.now()),
            visited: 0,
          };
          collection.insertOne(newUrl).then((doc) => {
            console.log('New URL added');
            req.io.sockets.emit('newUrl', doc.ops[0].code);
            res.send({
              url: doc.ops[0].url,
              code: doc.ops[0].code,
              status: 200,
              statusTxt: 'OK',
            });
          }).catch(err => console.log('Error', err));
        }
      });
    });
  } else {
    res.send({
      status: 500,
      statusTxt: 'Not OK',
    });
  }
});

app.get('/:urlId', (req, res) => {
  let redirectUrl = '/';
  MongoClient.connect(url, (err, client) => {
    if (err) throw err;
    const db = client.db('tiki');
    const collection = db.collection('urls');
    collection
      .findOne({
        code: req.params.urlId,
      }).then((doc) => {
        if (doc) {
          collection.updateOne({
            url: doc.url,
          }, {
            $set: {
              visited: doc.visited + 1,
              lastVisited: (Date.now()),
            },
          });
          redirectUrl = doc.url;
        }
      }).then(() => res.redirect(redirectUrl));
  });
});

const initData = () => {
  MongoClient.connect(url, (err, client) => {
    if (err) throw err;
    const db = client.db('tiki');
    db.collection('urls')
      .insertMany([{
        url: 'https://tiki.vn/',
        code: '111111',
        lastVisited: Date.now(),
        visited: 0,
      }, {
        url: 'https://www.google.com.vn',
        code: '222222',
        lastVisited: Date.now(),
        visited: 0,
      }, {
        url: 'https://www.wikipedia.com',
        code: '333333',
        lastVisited: Date.now(),
        visited: 0,
      }, {
        url: 'https://www.google.com.vn',
        code: '444444',
        lastVisited: Date.now(),
        visited: 0,
      }, {
        url: 'https://www.google.com.vn',
        code: '555555',
        lastVisited: 1,
        visited: 0,
      }]);
  });
};

const removeAll = () => {
  MongoClient.connect(url, (err, client) => {
    if (err) throw err;
    const db = client.db('tiki');
    db.collection('urls')
      .deleteMany();
  });
};

const cleanUp = () => {
  console.log('Cleanup triggered');
  MongoClient.connect(url, (err, client) => {
    if (err) throw err;
    const db = client.db('tiki');
    db.collection('urls')
      .deleteMany({
        lastVisited: {
          // 2 weeks in milliseconds
          $lt: (Date.now() - 1.21e+9),
        },
      });
  });
};
// cleanup everyday
setInterval(cleanUp, 8.64e+7);

// cleanUp();
// initData();
// removeAll();
server.listen(app.get('port'), () => console.log(`Listening on port ${app.get('port')}`));