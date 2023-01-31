const config = require("./config");
const mysql = require("mysql2");

const connection = mysql.createConnection(config);

connection.query(
  `CREATE TABLE IF NOT EXISTS department (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        name VARCHAR(30)
    )`,
  function (err, results, fields) {
    console.log(results);
    console.log(fields);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS role (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        title VARCHAR(30),
        salary DECIMAL,
        department_id INT
    )`,
  function (err, results, fields) {
    console.log(results);
    console.log(fields);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS employee (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30),
        last_name VARCHAR(30),
        role_id INT,
        manager_id INT
    )`,
  function (err, results, fields) {
    console.log(results);
    console.log(fields);
  }
);
