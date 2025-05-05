-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS vendor_database;
USE vendor_database;

-- Create auth table
CREATE TABLE IF NOT EXISTS auth (
    auth_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create department table
CREATE TABLE IF NOT EXISTS department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    respective_manager VARCHAR(255),
    no_of_ongoing_projects INT DEFAULT 0,
    no_of_finished_projects INT DEFAULT 0,
    no_of_people_in_department INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create employee table
CREATE TABLE IF NOT EXISTS employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    joining_date DATE NOT NULL,
    department INT,
    manager_id INT,
    rating_overall DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department) REFERENCES department(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS listofprojects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    project_name VARCHAR(255) NOT NULL,
    starting_date DATE NOT NULL,
    project_manager INT NOT NULL,
    co_manager INT,
    deadline DATE,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
    no_of_people_working INT DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
    FOREIGN KEY (project_manager) REFERENCES employee(employee_id) ON DELETE RESTRICT,
    FOREIGN KEY (co_manager) REFERENCES employee(employee_id) ON DELETE SET NULL
);

-- Create project assignments table
CREATE TABLE IF NOT EXISTS employeeprojects (
    employee_id INT,
    list_project_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (employee_id, list_project_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (list_project_id) REFERENCES listofprojects(project_id) ON DELETE CASCADE
);

-- Insert demo user
INSERT INTO auth (email, password) VALUES ('admin@example.com', 'password123')
ON DUPLICATE KEY UPDATE password = VALUES(password); 