var inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql2");
const config = require("./config");

const getDepartments = () => {
  const connection = mysql.createConnection(config);
  return new Promise((resolve, reject) => {
    connection.query(
      `select * from department`,
      function (err, results, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
};

const getManagers = () => {
  const connection = mysql.createConnection(config);
  return new Promise((resolve, reject) => {
    connection.query(
      ` select * from employee`,
      function (err, results, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
};

const getRoles = () => {
  const connection = mysql.createConnection(config);
  return new Promise((resolve, reject) => {
    connection.query(`select * from role`, function (err, results, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
      connection.end();
    });
  });
};

inquirer
  .prompt([
    {
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "view all roles",
        "view all employees",
        "add a department",
        "add a role",
        "add an employee",
      ],
      loop: true,
    },
  ])
  .then(async (answers) => {
    const connection = mysql.createConnection(config);
    if (answers.action === "View all departments") {
      connection.query(
        `
            SELECT * from department
        `,
        function (err, results, fields) {
          console.table(results);
          connection.end();
        }
      );
    }
    if (answers.action === "view all roles") {
      connection.query(
        `
            SELECT role.id, role.title, role.salary, department.name
            from role INNER JOIN department
            ON role.department_id = department.id
        `,
        function (err, results, fields) {
          console.table(results);
          connection.end();
        }
      );
    }
    if (answers.action === "view all employees") {
      connection.query(
        `
            SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
        `,
        function (err, results, fields) {
          console.table(results);
          connection.end();
        }
      );
    }
    if (answers.action === "add a department") {
      inquirer
        .prompt([
          {
            name: "department",
            type: "input",
            message: "What is the name of the department?",
          },
        ])
        .then((answers) => {
          connection.query(
            `
                INSERT INTO department (name)
                VALUES ('${answers.department}')
            `,
            function (err, results, fields) {
              if (err) {
                console.log(err);
              } else {
                console.log("Department added!");
              }
              connection.end();
            }
          );
        });
    }
    if (answers.action === "add a role") {
      getDepartments().then((departments) => {
        inquirer
          .prompt([
            {
              name: "title",
              type: "input",
              message: "What is the title of the role?",
            },
            {
              name: "salary",
              type: "input",
              message: "What is the salary of the role?",
            },
            {
              name: "department_id",
              type: "list",
              message: "What is the department of the role?",
              choices: departments.map((department) => {
                return {
                  name: department.name,
                  value: department.id,
                };
              }),
            },
          ])
          .then((answers) => {
            connection.query(
              `
                INSERT INTO role (title, salary, department_id)
                VALUES ('${answers.title}', ${answers.salary}, ${answers.department_id})
            `,
              function (err, results, fields) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Role added!");
                }
                connection.end();
              }
            );
          });
      });
    }
    if (answers.action === "add an employee") {
      const roles = await getRoles();
      const managers = await getManagers();
      if (managers.length === 0) {
        managers.push({ id: "", first_name: "", last_name: "" });
      }
      inquirer
        .prompt([
          {
            name: "first_name",
            type: "input",
            message: "What is the first name of the employee?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is the last name of the employee?",
          },
          {
            name: "role_id",
            type: "list",
            message: "What is the role of the employee?",
            choices: roles.map((role) => {
              return {
                name: role.title,
                value: role.id,
              };
            }),
          },
          {
            name: "manager_id",
            type: "list",
            message: "What is the manager name of the employee?",
            choices: managers.map((manager) => {
              return {
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id,
              };
            }),
          },
        ])
        .then((answers) => {
          //if manager is not selected, set it to null
          if (!answers.manager_id) {
            answers.manager_id = null;
          }
          connection.query(
            `
                INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ('${answers.first_name}', '${answers.last_name}', ${answers.role_id}, ${answers.manager_id})
            `,

            function (err, results, fields) {
              if (err) {
                console.log(err);
              } else {
                console.log("Employee added!");
              }
              connection.end();
            }
          );
        });
    }
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
