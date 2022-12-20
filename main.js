const socket = io();
let username;
let typing = false;
const cUsers = new Set();

const $window = $(window);
const $usernameInput = $('.usernameInput');
var $messageInput = $('#input');
var $currentInput = $usernameInput.focus();


const $loginPage = $('.login.page');        // The login page
const $chatPage = $('.chat.page');          // The chatroom page


var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

const inboxPeople = document.getElementById("inbox_people");


// functions

const setUsername = () => {
    username = $usernameInput.val().trim();

    if (username) {
        $loginPage.fadeOut();
        $chatPage.show();

        socket.emit('new user', username);
    }

};

const addToUsersBox = (username) => {
    const userBox = `
                <div id="${username}-userlist">
                    <h5 id="${username}-Header">${username}</h5>
                </div>
                `;
    inboxPeople.innerHTML += userBox;
};

const userIsTyping = (username, bool) => {
    let buff = username + '-Header';
    if (bool) {
        document.getElementById(buff).innerHTML = (username + ' is typing...');
    } else {
        //addToMessageBox('Stop typing event');
        document.getElementById(buff).innerHTML = username;
    }
};

const addToMessageBox = (msg) => {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    const scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
};



// event listeners

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', username + ': ' + input.value);
        input.value = '';
    }
});


// key events

$window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
        if (username) {
            if (input.value) {
                if (!typing) {
                    typing = true;
                    socket.emit('typing', username);
                }
            } else {
                typing = false;
                //addToUsersBox('Empty event');
                socket.emit('stop typing', username);

            } 
        } 
    }

    // When the user hits the 'Enter' key
    if (event.which === 13) {
        if (username) {
            //sendMessage();
            //addToUsersBox('Enter event');
            socket.emit('stop typing', username);
            typing = false;
        } else {
            setUsername();
        }
    }
});


// socket events

socket.on('new user', (data) => {
    //only send users that aren't on this sockets user list
    data.map((user) => {
        if (cUsers.has(user)) { return; }
        cUsers.add(user);
        addToUsersBox(user);
    });
});

socket.on('chat message', (msg) => {
    addToMessageBox(msg);
});

socket.on('typing', (user) => {
    userIsTyping(user, true);
});

socket.on('stop typing', (user) => {
    userIsTyping(user, false);
});

socket.on('disconnection', (user) => {
    let buff = user + '-userlist';
    $('#' + buff).remove();
    cUsers.delete(user);
    let msg = user + ' disconnected';
    addToMessageBox(msg);
});

socket.on('connection', (msg) => {
    addToMessageBox(msg);
});




/* Problems
 * Why am I even doing doing this? What am I even learning? Is this worth the time I am spending?
 * 
 * UI looks like crap. 
 * 
 * So many events seem to be sent when not necessary?
 */