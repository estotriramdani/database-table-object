const fs = require('fs');
const { executeQuery } = require('./helpers/queryBuilder');

const defaultValues = {
  databaseConfig: {
    host: '',
    user: '',
    port: 3306,
    password: '',
    database: '',
  },
  pathToFile: '',
};

async function databaseTableObjects(params = defaultValues) {
  const { databaseConfig, pathToFile } = params;
  const sql = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA='${databaseConfig.database}'`;
  const result = await executeQuery({
    databaseConfig,
    sql,
  });
  const {
    data: { results: dataAll },
  } = result;
  let tableName = {};
  for (let index = 0; index < dataAll.length; index++) {
    const element = dataAll[index];
    const sql = `SELECT * FROM ${element.TABLE_NAME} LIMIT 1`;
    const result = await executeQuery({
      databaseConfig,
      sql,
    });

    const {
      data: { fields },
    } = result;

    let info = {};
    fields.forEach((key) => {
      info = {
        ...info,
        [key]: `${element.TABLE_NAME}.${key}`,
        [`${key}_plain`]: `${key}`,
      };
    });

    tableName = {
      ...tableName,
      [element.TABLE_NAME]: {
        name: element.TABLE_NAME,
        fields: info,
      },
    };
  }

  const splitPath = pathToFile.split('.');
  const extension = splitPath[splitPath.length - 1];

  let content = `/* eslint-disable */ \nconst tables = ${JSON.stringify(
    tableName
  )}\nmodule.exports = tables;`;

  if (extension === 'json') {
    content = JSON.stringify(tableName);
  }
  fs.writeFileSync(pathToFile, content);
  console.log(`DONE UPDATING CREATING TABLE OBJECTS FILE in "${pathToFile}"`);
}

module.exports = databaseTableObjects;
