const express = require('express');
const bodyParser = require('body-parser');

const router = require('./router');
const middlewares = require('./middlewares');

// console.log('middlewares: ', middlewares);

const app = express();

app.use(
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }),
  middlewares.extendApiOutput,
  middlewares.rateLimiter({
    limit: 100
  })
);

router(app);

app.use((err, req, res, next) => {
  res.status(500);
  res.apiError(err);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
