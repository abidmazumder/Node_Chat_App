const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.getElementById('send-location');
const $messages = document.querySelector('#messages');
const $sideBar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTepmlate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //New Message Element
  const $newMessage = $messages.lastElementChild;

  //Height of the last messages
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container

  const containerHeight = $messages.scrollHeight;

  //How far I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//
socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('H:mm'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
//

socket.on('locationMessage', (info) => {
  const html = Mustache.render(locationTemplate, {
    username: info.username,
    url: info.url,
    createdAt: moment(info.createdAt).format('H:mm'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
//

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sideBarTepmlate, {
    room,
    users,
  });
  $sideBar.innerHTML = html;
});

//

$messageForm.addEventListener('submit', (e) => {
  $messageFormButton.setAttribute('disabled', 'disabled');
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log('Message Delivered');
    input = '';
  });
});

function locate() {
  if (!navigator.geolocation) {
    return alert('GeoLocation is not supported by your browser');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (message) => {
        $sendLocationButton.removeAttribute('disabled');
        console.log(message);
      }
    );
  });
}

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
