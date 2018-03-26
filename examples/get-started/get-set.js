module.exports = (client, cb) => {
  client.set('foo', 'bar', () => {
    client.get('foo', (error, fooValue) => {
      if (error) throw error;
      console.log(fooValue);
      cb();
    });
  });
};
