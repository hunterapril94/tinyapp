const emailLookup = (email, database) => {
  let answer = "";
  for (const userId in database) {
    if (database[userId].email === email) {
      answer = database[userId];
    }
  }
  return answer;
};

const urlsForUserId = function(userId, database) {
  let IdUrls = {};
  for (const url in database) {
    if (database[url].userId === userId) {
      IdUrls[url] = database[url];
    }
  }
  return IdUrls;
};

const getRandomString = function() {
  let random = "";
  const options = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 62);
    random += options[num];
  }
  return random;
};

module.exports = {emailLookup, urlsForUserId, getRandomString}