 
var SQLite = require('react-native-sqlite-storage');

var db = SQLite.openDatabase({
  name: 'data.db',
  createFromLocation: '~data.db',
});

export default db;