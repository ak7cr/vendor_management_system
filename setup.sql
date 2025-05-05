CREATE TABLE IF NOT EXISTS department (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_name VARCHAR(100) NOT NULL,
  respective_manager VARCHAR(100),
  no_of_ongoing_projects INT DEFAULT 0,
  no_of_finished_projects INT DEFAULT 0,
  no_of_people_in_department INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS employee (
  employee_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  dob DATE,
  joining_date DATE NOT NULL,
  department INT,
  manager_id INT,
  rating_overall DECIMAL(3,2) DEFAULT 0.00,
  FOREIGN KEY (department) REFERENCES department(id),
  FOREIGN KEY (manager_id) REFERENCES employee(employee_id)
);

CREATE TABLE IF NOT EXISTS listofprojects (
  project_id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT,
  project_name VARCHAR(200) NOT NULL,
  starting_date DATE NOT NULL,
  project_manager INT,
  co_manager INT,
  deadline DATE,
  status ENUM('Not Started', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Not Started',
  no_of_people_working INT DEFAULT 0,
  remarks TEXT,
  FOREIGN KEY (department_id) REFERENCES department(id),
  FOREIGN KEY (project_manager) REFERENCES employee(employee_id),
  FOREIGN KEY (co_manager) REFERENCES employee(employee_id)
);

CREATE TABLE IF NOT EXISTS auth (
  auth_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
); 