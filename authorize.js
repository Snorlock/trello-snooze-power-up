var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var authenticationSuccess = function() {
  Trello.get('members/me',{fields:'username'}, function(data) {
    $.ajax({
      method: "GET",
      url: "https://trello-snooze-webhook.herokuapp.com/auth?id="+data.id+"&username="+data.username+"&value="+Trello.token()
    })
    .done(function( msg ) {
      t.set('board', 'private', 'auth', 'true')
      .then(function() {
        t.set('board', 'private', 'id', data.id)
        .then(function() {
          t.closePopup();
        })
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
