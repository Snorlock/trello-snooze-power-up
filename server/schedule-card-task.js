var Express = require('express');
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var request = require('superagent');
var app = Express();
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var Timeout = require('./models/timeout.js');
var User = require('./models/user.js');
var moment = require('moment');

mongoose.connect(process.env.MONGODB_URI);
var appKey = process.env.APPKEY;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello to you!')
});

app.get('/auth', function (req, res) {
  User.findOneAndUpdate({ id: req.query.id },{ token: req.query.value },{upsert: true})
  .then(function() {
    res.json({ id: req.query });
  })
  .catch(function(err) {
    console.log(err);
    res.json({ error:true, errorobj:err });
  });
});

app.get('/close', function (req, res) {
  User.findOne({ id: req.query.userid })
  .then(function(obj) {
    closeCard(true, req.query.id, obj.token)
    .end(function(err,response){
      if(err) {
        console.log(err)
        res.json({error:true, errorobj:err})
      } else {
        console.log("TRYING TO POST")
        postCommentOnCard(req.query.id, obj.token, 'Card have been archived by SnoozeCards powerup until '+new Date(parseInt(req.query.unix)));
        console.log("SAVING INTERVAL TASK");
        saveIntervalTask(req.query.id, obj.token, req.query.unix, req.query.userid)
        res.json({error:false})
      }
    })
  })
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+app.get('port'));
});

var saveIntervalTask = function(card, token, unix, user) {
  var expireTime = moment(parseInt(unix)).add(30,'s');
  var timeout = new Timeout({card: card, unix: unix, user:user, expireAt: expireTime.toDate()});
  timeout.save()
  .then(function(obj) {
    console.log('saved successfully:', obj);
  })
  .catch(function(err){
    console.log(err);
    postCommentOnCard(card, token, 'Failed to save snooze task, reopen card and try again');
  })
}

var closeCard = function(closed, cardId, token) {
  return request('PUT', 'https://api.trello.com/1/cards/'+cardId+'/closed?key='+appKey+'&token='+token)
    .set('Content-Type', 'application/json')
    .send({ "value" : closed })

}

var openCardAfterTimeoutExpiration = function(cardId, token) {
  request('PUT', 'https://api.trello.com/1/cards/'+cardId+'/closed?key='+appKey+'&token='+token)
    .set('Content-Type', 'application/json')
    .send({ "value" : false })
    .end(function(err, response) {
      if(err) {
        console.log("Error on reopening the card");
        console.log(err);
        postCommentOnCard(cardId, token, 'Card could not be woken up, because error');
      } else {
        postCommentOnCard(cardId, token, 'Card have succesfully been woken up');
      }
    })
}

var postCommentOnCard = function(cardId, token, message) {
  request('POST', 'https://api.trello.com/1/cards/'+cardId+'/actions/comments?key='+appKey+'&token='+token)
    .set('Content-Type', 'application/json')
    .send({ "text" : message })
    .end(function(err, response) {
      if(err) {
        console.log("Fallback method did not work!!!!!")
        console.log(err)
      } else {
        console.log("commented on card to keep it updated!")
      }
    })
}

var checkAndUnsnoozeCards = function() {
  var now = moment();
  var twentySecondsAhead = moment(now).add(20,'s')
  var cursor = Timeout.find()
    .where('unix')
    .gt(now.valueOf())
    .lt(twentySecondsAhead.valueOf())
    .cursor()

  cursor.on('data', function(doc) {
    User.findOne({ id: doc.user })
    .then(function(user) {
      var token = user.token;
      openCardAfterTimeoutExpiration(doc.card, token);
    })
  })
}

setInterval(checkAndUnsnoozeCards, 20000)
