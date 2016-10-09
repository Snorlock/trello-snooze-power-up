var Express = require('express');
// var Webtask = require('webtask-tools');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var request = require('superagent');
var app = Express();

var myFirebaseRef = new Firebase(process.env.FIREBASEURL);
var timeoutlist = {};
var appKey = process.env.APPKEY;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
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

// GET
app.get('/', function (req, res) {
  myFirebaseRef.child(req.query.id).set({
    token: req.query.value ? req.query.value : ""
  });
  res.json({ id: req.query });
});

app.get('/status', function (req, res) {
  res.json({ timeouts: timeoutlist })
});

app.get('/close', function (req, res) {
  myFirebaseRef.child(req.query.userid).once('value')
  .then(function(snapshot) {
    console.log(snapshot.val().token)
    closeCard(true, req.query.id, snapshot.val().token)
    .end(function(err,response){
      if(err) {
        console.log(err)
        res.json({error:true, errorobj:err})
      } else {
        console.log("setting inteervaltask")
        postCommentOnCard(req.query.id, snapshot.val().token, 'Card have been archived by SnoozeCards powerup');
        setIntervalTask(req.query.id, snapshot.val().token, req.query.unix)
        res.json({error:false})
      }
    })
  })
});

var setIntervalTask = function(cardId, token, unix) {
  var now = new Date();
  var ms = unix-now.valueOf()
  var timoutId = setTimeout(openCardAfterTimeoutExpiration, ms, cardId, token);
  timeoutlist[cardId] = timoutId;
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
        console.log("Card reopened");
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

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+app.get('port'));
});

// module.exports = Webtask.fromExpress(app);
