-- Insert departments
INSERT INTO department (department_name, respective_manager, no_of_ongoing_projects, no_of_finished_projects, no_of_people_in_department)
VALUES 
('Engineering', 'John Smith', 3, 5, 15),
('Marketing', 'Sarah Johnson', 2, 3, 8),
('Sales', 'Michael Brown', 1, 4, 10);

-- Insert employees (without manager_id first)
INSERT INTO employee (name, email, phone, joining_date, department, rating_overall)
VALUES 
('John Smith', 'john.smith@example.com', '123-456-7890', '2022-01-01', 1, 4.5),
('Sarah Johnson', 'sarah.johnson@example.com', '234-567-8901', '2022-02-01', 2, 4.2),
('Michael Brown', 'michael.brown@example.com', '345-678-9012', '2022-03-01', 3, 4.0);

-- Update employees with manager_id
UPDATE employee SET manager_id = 1 WHERE email = 'sarah.johnson@example.com';
UPDATE employee SET manager_id = 1 WHERE email = 'michael.brown@example.com';

-- Insert projects
INSERT INTO listofprojects (department_id, project_name, starting_date, project_manager, co_manager, deadline, status, no_of_people_working)
VALUES 
(1, 'Website Redesign', '2024-01-01', 1, 2, '2024-06-30', 'In Progress', 5),
(2, 'Marketing Campaign', '2024-02-01', 2, 3, '2024-05-31', 'In Progress', 3),
(3, 'Sales Analytics', '2024-03-01', 3, 1, '2024-07-31', 'Not Started', 4);

-- Insert auth records
INSERT INTO auth (email, password)
VALUES 
('john.smith@example.com', 'password123'),
('sarah.johnson@example.com', 'password456'),
('michael.brown@example.com', 'password789'); 