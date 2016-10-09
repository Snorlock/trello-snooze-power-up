var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

t.render(function(){

});
console.log(Trello.authorized())

var authenticationSuccess = function() {
  var secret = TrelloPowerUp.PostMessageIO.randomId();
	console.log("Successful authentication. Token is:" + Trello.token());
  $.ajax({
    method: "GET",
    url: "https://trello-snooze-webhook.herokuapp.com?id="+secret+"&value="+Trello.token()
  })
  .done(function( msg ) {
    t.set('board', 'private', 'auth', 'true')
    .then(function() {
      t.set('board', 'private', 'id', secret)
      .then(function() {
        t.closePopup();
      })
    })
  })
};
var authenticationFailure = function() {
	console.log("Failed authentication");
};

document.getElementById('authorize').addEventListener('click', function(){
  Trello.authorize({
	  type: "popup",
	  name: "SnoozeCards",
	  scope: {
	    read: true,
	    write: true },
	  expiration: "never",
	  success: authenticationSuccess,
	  error: authenticationFailure
	});
})
