const users = [];

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: 'username and room required',
    };
  }

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Validate Username
  if (existingUser) {
    return {
      error: 'Username is in use!',
    };
    //store user
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};
//remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
//getuser
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//getUsersInRoom

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
