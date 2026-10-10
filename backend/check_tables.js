const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'db.fr-roub1.bengt.wasmernet.com',
      port: 20184,
      user: 'user_1176a84d',
      password: 'pw_XXE0D1QXb3cIXCqhyYHW4aaoGodY3mgT',
      database: 'gamesphere',
    });

    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables:', tables);

    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
