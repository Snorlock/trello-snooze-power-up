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
    'format-url': function(t, options) {
        if(options.url.length > 20) {
            return {
                icon: './images/trello-icon.png'

            };
        } else {
            throw t.NotHandled("Not a handled URL");
        }
    },
    'card-from-url': function(t, options) {
        return {
            name: 'All New Cards have this name',
            desc: 'All New cards have this description'
        };
    },
    'show-settings': function(t, options) {
        t.popup({
            title: "Authorize Account",
            url: 'settings.html',
            height: 250
        });
    }
});
