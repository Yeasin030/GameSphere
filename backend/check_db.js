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

    console.log('Connected to database');

    const [roles] = await connection.execute('SELECT * FROM roles');
    console.log('Existing roles:', roles);

    if (roles.length === 0) {
      console.log('Inserting default roles...');
      await connection.execute(`
        INSERT INTO roles (name, guard_name, created_at, updated_at) 
        VALUES 
          ('user', 'web', NOW(), NOW()),
          ('admin', 'web', NOW(), NOW())
      `);
      console.log('Default roles inserted successfully.');
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
