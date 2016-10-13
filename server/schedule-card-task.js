var Express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var request = require('superagent');
var app = Express();
var mongoose = require('mongoose');
var Timeout = require('./models/timeout.js');
var moment = require('moment');

// mongoose.connect(process.env.MONGODB_URI);
mongoose.connect('mongodb://vongohren:1234qwerty@ds039058.mlab.com:39058/heroku_q4t60678');

// var config = {
//   serviceAccount: JSON.parse(process.env.SERVICEACCOUNT),
//   databaseURL: process.env.FIREBASEURL,
//   databaseAuthVariableOverride: {
//     uid: process.env.WORKERID
//   }
// };

var config = {
 serviceAccount: { "type": "service_account", "project_id": "trello-snooze-8c244", "private_key_id": "d36d2ad2314a30e28e450123c932473151fb9099", "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJBo2k4EutEMYn\noSCQMwQ77ZJFFZ6jxrWTXEJnLJkoJg/6plZC5Jjy0StFUTumnhXz8dEEN5aXl62E\nBQZU/YrBshwUhZB5bddykgXh/u7N9hlDEY20pzDQly045qZxfaOlRp9HXN2fPNeB\n0wz2Wc8LkDS5xbmHkGXaaO19yyqW/CpTXWcdUCDKoqNRuY/+pQU3YBvBPEC2aTyn\n0s0pKLcQqputEWWaDmxbl/NjeJgnJxPPbYOt9jv05JpLPN1Uz6aUAU2Rh0cCnRq1\n0BduD+1jw8BzctGQIFLRriJ8JctSihdUIc9BXmSImQC/vPLio0ML30ond7LrWlX/\nOcBIloWjAgMBAAECggEAEoYXEUVV09nC2K4BSShaUIdgvhry5laOLskGmWlDp65y\nNH+VXU6hRWa+3QFSRNU2Yqc6wm+44bkpVQv9fGFsotKdwcpY+MeFXdpUznFmYfY2\nd7arXyU021PC6AZg+f5A0R8D2FiXV3AMz7q57A10hbVBFolAwlws9oZKtBe/ke/6\ny0FQJTNLLeL/YyYVzxvZ3EDouqlV5v8Ov19EkYkum4nuPANVQxtB7n7Fz0+frho9\nzWbtWubRlh8cvn8LJknc5DCcxPdk276gO5xTV1KeBVlmrpt6d5NDBHbPyhjTXwoj\nTXsTZJdH3+bZxfyYbyYu2pKaopS7rKilPvlDU8jOAQKBgQDkqnnn8yWxs475HR5B\nbtkxiCaZzwtxV4jKpCvLoX2VtIPQ+mUFVw77s3ZQWBLFa+Vo5Mi5DdTRh61PhWU0\nzf9oXPA2QkgmXso0FAbxakzEKy4dcx8YiIOZt/1K0WQmxTBYlE4MNgEcYlXKOpgZ\ndaGhoBCYiXV4ZbiD7B27Qc/hAQKBgQDhDj3F2fFxtfOFUaq9Mb6lAeWon/3U/puy\npHvP2xrTKQFJBqBIa1UGsH63Addjrab8iNveLNG9+2iZQWEQHc9jOGbkdUO2kku3\ncMzhhoptWFFNCB7F6hO7cYhOSABcnsBxvaYyYKtN3VGunvylCoxKswFMzaQGUmj6\nZ52jkThCowKBgHfkkop1SFxF4z7mb4irUCHSWzrl/f/tf4GQVo4sHCa0QTD/OJx2\nKxr5250AsMbmbaBz5HJyuBUsaEh7jrcDE1lq8V/hnObRaH+pyIIn1Bw+76ztQW6h\nlS6x85KY+0QAu/qVt95bKnXxcT3ZPwqKTLbrsAfqercnznkNAgG+3foBAoGBAKho\ncL8p7GurvROpXft/SurM9Z7uQhJth/Lw9JlAmt0iVQzhQXWPo6uCzP+DCDtVyZw1\niVnC7hydEdOEwe4+cF8N6KjSOx5WcQRPC3FDrThPm17qUaTGGYftWBND+8lTHiy+\nvqv5/JYipCnoXKPftcV8F9/yDeiRKG8gtCye0ZvDAoGAewKo3/tW96ZFAuLFS6Zp\nP02IkBHfdJFLqkNd3MG8DkttPe57uQj+e/l7AAMAMbJ9Dzu6Ii9Kb0uev5MxdZVP\nHBjVWFags3R50UYf+Gk1tNKjrqsnuAtnz1hXeRhSDAxjewMMhrExHIOoiCTxsSoj\n+p7EMcRsv+EzVGYQSBy7maY=\n-----END PRIVATE KEY-----\n", "client_email": "thesnoozeservice@trello-snooze-8c244.iam.gserviceaccount.com", "client_id": "115527669912662399712", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://accounts.google.com/o/oauth2/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/thesnoozeservice%40trello-snooze-8c244.iam.gserviceaccount.com" },
 databaseURL: 'https://trello-snooze-8c244.firebaseio.com/',
 databaseAuthVariableOverride: {
   uid: 'my-service-worker'
 }
};

var firebaseRef = firebase.initializeApp(config);
// var appKey = process.env.APPKEY;
var appKey = '029a2bec58250bca0e3f1a29451f13ce'

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
        postCommentOnCard(req.query.id, snapshot.val().token, 'Card have been archived by SnoozeCards powerup until '+new Date(parseInt(req.query.unix)));
        saveIntervalTask(req.query.id, snapshot.val().token, req.query.unix, req.query.userid)
        res.json({error:false})
      }
    })
  })
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

var checkAndUnsnoozeCards = function() {
  var now = moment();
  var twentySecondsAhead = moment(now).add(20,'s')
  console.log('now: '+now.valueOf());
  console.log('20: '+twentySecondsAhead.valueOf());
  var cursor = Timeout.find()
    .where('unix')
    .gt(now.valueOf())
    .lt(twentySecondsAhead.valueOf())
    .cursor()

  cursor.on('data', function(doc) {
    console.log(doc);
  })
}

setInterval(checkAndUnsnoozeCards, 5000)
