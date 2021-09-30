const { assert } = require('chai');

const { emailLookup, urlsForUserId, getRandomString } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput)
  });
  it('should return empty string with invalid email', function() {
    const user = emailLookup('d@d.com')
    const expectedOutput = ""
    assert.strictEqual(user, expectedOutput)
  })
});