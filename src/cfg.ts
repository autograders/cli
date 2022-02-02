const testURL = 'http://localhost:5000/graphql';
const prodURL = 'https://api.autograders.org/graphql';

const cfg = {
  apiURL: process.env.TEST ? testURL : prodURL,
  cookie: 'autograders-platform.session-token',
  dir: '.autograder'
};

export default cfg;
