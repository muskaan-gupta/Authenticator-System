# Authenticator-System
The Authenticator System is a secure backend solution designed to manage user authentication and access control efficiently. It allows users to register, log in, and reset passwords while ensuring data security through password hashing with bcrypt.

# Features: 

- ***User Authentication:*** Secure login and registration using hashed passwords.

- ***Password Encryption:*** Utilized bcrypt for hashing passwords, ensuring enhanced security.

- ***Token-Based Authentication:*** Implemented JWT (JSON Web Token) for stateless user authentication.

- ***Database Integration:*** Used MongoDB for efficient data storage and retrieval.

- ***Server-Side Frameworks:*** Built with Node.js and Express.js for handling backend operations.
  
# Tech Stack

- ***Node.js:*** JavaScript runtime for building scalable server-side applications.
- ***Express.js:*** Lightweight web application framework for creating RESTful APIs.
- ***MongoDB:*** NoSQL database for flexible and efficient data storage
- ***JWT:*** Secure token-based authentication mechanism.
- ***bcrypt:*** Library for hashing and comparing user passwords.

# How It Works

***User Registration:***
- User details (e.g., email and password) are submitted.
Passwords are hashed using bcrypt before being saved to the database.

***User Login:***

- Credentials are verified against the database.
On success, a JWT token is generated and sent to the user.
Protected Routes:
- Routes are secured using middleware that verifies the JWT token.
Unauthorized access attempts are denied.

![alt text](<Screenshot (64).png>)