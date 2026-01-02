CREATE DATABASE mobilestore;
USE mobilestore;

CREATE TABLE USER (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30),
  password VARCHAR(30)
);

CREATE TABLE MOBILE (
  mobile_id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(30),
  model VARCHAR(30),
  ram VARCHAR(10),
  storage VARCHAR(10),
  price INT,
  stock INT
);

CREATE TABLE ORDERS (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  mobile_id INT,
  order_date DATE,
  FOREIGN KEY (user_id) REFERENCES USER(user_id),
  FOREIGN KEY (mobile_id) REFERENCES MOBILE(mobile_id)
);

INSERT INTO USER(username,password) VALUES ('admin','admin');

INSERT INTO MOBILE(company,model,ram,storage,price,stock) VALUES
('Samsung','S21','8GB','128GB',55000,5),
('Samsung','A14','6GB','128GB',18000,3),
('Apple','iPhone 13','6GB','128GB',65000,2),
('Redmi','Note 12','6GB','128GB',15000,0);
