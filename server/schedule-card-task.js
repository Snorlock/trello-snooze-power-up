var Express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var request = require('superagent');
var app = Express();
var mongoose = require('mongoose');
var Timeout = require('./models/timeout.js');
var moment = require('moment');

mongoose.connect(process.env.MONGODB_URI);

var config = {
  serviceAccount: JSON.parse(process.env.SERVICEACCOUNT),
  databaseURL: process.env.FIREBASEURL,
  databaseAuthVariableOverride: {
    uid: process.env.WORKERID
  }
};

var firebaseRef = firebase.initializeApp(config);
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
  firebaseRef.database().ref(req.query.id).set({
    token: req.query.value ? req.query.value : "",
    username: req.query.username
  }).then(function(data){
    res.json({ id: req.query });
  }).catch(function(err){
    res.json({ error:true, errorobj:err });
  });

});

app.get('/close', function (req, res) {
  firebaseRef.database().ref(req.query.userid).once('value')
  .then(function(snapshot) {
    closeCard(true, req.query.id, snapshot.val().token)
    .end(function(err,response){
      if(err) {
        console.log(err)
        res.json({error:true, errorobj:err})
      } else {
        console.log("TRYING TO POST")
        postCommentOnCard(req.query.id, snapshot.val().token, 'Card have been archived by SnoozeCards powerup until '+new Date(parseInt(req.query.unix)));
        console.log("SAVING INTERVAL TASK");
        saveIntervalTask(req.query.id, snapshot.val().token, req.query.unix, req.query.userid)
        res.json({error:false})
      }
    })
  })
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+app.get('port'));
});

var saveIntervalTask = function(card, token, unix, user) {
  console.log(card)
  console.log(user)
  var timeout = new Timeout({card: card, unix: unix, user:user})
  timeout.save(function(err, obj) {
    if (err) {
      console.log(err);
      postCommentOnCard(cardid, token, 'Failed to save snooze task, reopen card and try again');
    } else {
      console.log('saved successfully:', obj);
    }
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
        console.log(response);
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
    firebaseRef.database().ref(doc.user).once('value')
    .then(function(snapshot) {
      var token = snapshot.val().token;
      openCardAfterTimeoutExpiration(doc.card, token);
    })
  })
}

setInterval(checkAndUnsnoozeCards, 20000)
