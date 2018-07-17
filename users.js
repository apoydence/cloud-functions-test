exports.find = (user_id, onSuccess, onError) => {
    let query = util.format('SELECT id,username,sec_level FROM user_values where id=%d LIMIT 1', user_id);

    pool().query(query, (err, results) => {
        if (err) {
            onError(err)
            return;
        }

        if (results.rows.length == 0) {
            onError(null);
            return;
        }

        onSuccess({
            id: user_id,
            username: results.rows[0].username,
            sec_level: results.rows[0].sec_level,
            links: [
                {rel: "self", method: "GET", href: "/users/"+user_id},
                {rel: "delete", method: "DELETE", title: "Delete User", href: "/users/"+user_id},
            ],
        });
    });
};

function pool() {
  const pg = require('pg');

  const connectionName = process.env.CONN_NAME;
  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  return pg.Pool({
          max: 1,
          host: '/cloudsql/' + connectionName,
          user: dbUser,
          password: dbPass,
          database: dbName
      });
}
