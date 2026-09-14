const bcrypt = require('bcrypt');

const password = 'admin567'; // cámbiala por la que quieras usar

bcrypt.hash(password, 10).then(hash => {
  console.log('Hash generado:');
  console.log(hash);
});