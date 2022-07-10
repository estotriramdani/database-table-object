const mysql = require('mysql2');

const queryBuilder = ({ databaseConfig, query = false }) =>
  new Promise((resolve, reject) => {
    const con = mysql.createPool({
      ...databaseConfig,
    });
    con.query(query, (err, result, fields) => {
      if (err) reject(err);
      con.end();
      resolve({
        results: result,
        fields: fields.map((element) => {
          return element.name;
        }),
      });
    });
  });

const executeQuery = async ({ databaseConfig, sql }) => {
  let result = {
    status: 'pending',
    message: 'Failed to execute query',
    data: { results: [], fields: [] },
  };
  try {
    const { results, fields } = await queryBuilder({
      databaseConfig,
      query: sql,
    });
    result = {
      status: 'success',
      message: 'Query executed successfully',
      data: { results, fields },
    };
  } catch (error) {
    result = {
      status: 'error',
      message: 'Failed to execute query',
      data: error,
    };
  }
  return result;
};

module.exports = { executeQuery, queryBuilder };
