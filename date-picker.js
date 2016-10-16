var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var now = moment.tz(moment.now().valueOf(),moment.tz.guess())
var fixedFuture = now.add(1,'day').hour(8).minute(0).format()
var rightShit = moment(fixedFuture).format('YYYY-MM-DDTHH:mm')

t.get('board', 'private', 'auth', null).then(function(auth) {
  console.log("AUTH");
  if(auth) {
    document.getElementById('content').innerHTML ='<p>Pick a date</p><input id="date" type="datetime-local" \><button id="snooze" class="mod-primary">Snooze</button>';
    document.getElementById('date').value = rightShit;
    document.getElementById('snooze').addEventListener('click', function(){
      var time = document.getElementById('date').value
      t.get('board', 'private', 'id', null).then(function(secret) {
        var date = moment(time);
        t.card('id').then(function(obj) {
          $.ajax({
            method: "GET",
            url: "https://trello-snooze-webhook.herokuapp.com/close?userid="+secret+"&id="+obj.id+"&unix="+date.valueOf(),
            timeout:5500
          })
          .done(function( msg ) {
            if(msg.error) {
              if(msg.errorobj.status === 401) {
                Trello.deauthorize();
                t.popup({
                  title: "Authorize",
                  url: './authorize.html'
                });
              }
            } else {
                t.closePopup();
            }
          })
        })
      })
    })
  } else {
    t.popup({
      title: "Authorize",
      url: './authorize.html'
    });
  }
})
