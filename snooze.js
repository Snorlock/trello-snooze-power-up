TrelloPowerUp.initialize({
    'card-buttons': function(t, card) {
        return [
        // Button with a nested popup callback
        {
            icon: './images/logo.png',
            text: "Snooze Card",
            callback: function(t, card) {
                return t.popup({
                  title:"Choose date",
                  url:"./date-picker.html"
                })
            }
        }];
    },
    'authorization-status': function(t) {
      // return a promise that resolves to the object with
      // a property 'authorized' being true/false
      return new TrelloPowerUp.Promise(function(resolve) {
        t.get('board', 'private', 'auth', null).then(function(auth) {
          if(auth) {
            resolve({ authorized: true })
          } else {
            resolve({ authorized: false })
          }
        })
      })
    },
    'show-authorization': function(t) {
        // return what to do when a user clicks the 'Authorize Account' link
        // from the Power-Up gear icon which shows when 'authorization-status'
        // returns { authorized: false }
        // in this case we will open a popup
        t.popup({
          title: 'My Auth Popup',
          url: 'authorize.html',
          height: 140,
        })
      },
});
