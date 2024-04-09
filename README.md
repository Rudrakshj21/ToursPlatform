**Tourism and Travel API**

This is Tourism and Travel API, designed to provide comprehensive data and functionalities for tourism and booking platforms. The API offers advanced features to streamline your development process and enhance user experience. Below are the key features and technologies utilized to ensure professionalism and efficiency:

**Features:**

1. **Data Querying:** Easily query all necessary data for tourism and booking needs.
2. **Advanced Functionality:** Includes sorting, filtering, pagination, searching, and limiting capabilities for efficient data retrieval.
3. **Geospatial Data Handling:** Seamlessly manage geospatial data for location-based services.
4. **Aggregation Pipelines:** Utilize MongoDB aggregation pipelines to obtain statistical insights.
5. **User Authentication and Authorization:** Secure user access with JWT-based authentication and authorization mechanisms.
6. **Server-side Rendering:** Implement server-side rendering using Pug template engine .
7. **Email Communication:** Enable email functionality through Nodemailer for reset password and communication purposes.
8. **Security Packages:** Incorporate essential security packages such as Helmet, XSS, and MongoSanitize to safeguard against common vulnerabilities.

**Technologies Used:**

- **Node.js:** A powerful runtime environment for server-side JavaScript execution.
- **Express.js:** A minimal and flexible Node.js web application framework for building APIs and web applications.
- **Mongoose:** An elegant MongoDB object modeling tool designed to work in an asynchronous environment.
- **MongoDB:** A scalable NoSQL database for storing and managing data efficiently.
- **Pug (formerly Jade):** A robust template engine for Node.js and browsers, ideal for server-side rendering.
- **JWT (JSON Web Tokens):** A compact, URL-safe means of representing claims to be transferred between two parties.
- **Nodemailer:** A module for Node.js applications to allow easy email sending.
- **Security Packages:** Essential security packages including Helmet for HTTP header protection, XSS for cross-site scripting prevention, and MongoSanitize for MongoDB query sanitization.

Certainly! Here's how you can incorporate the link into the README:

---

**Testing Instructions:**

For testing purposes, you can use the preexisting account with the following credentials:

- **Username:** rud@gmail.com
- **Password:** pass1234

After logging in with the provided credentials, ensure to navigate to any tour detail page and click on the "Book Tour" button. This action will direct you to the Stripe payment checkout. For testing purposes, you can use the following dummy card details:

- **Card Number:** 4242 4242 4242
- **Expiration Date:** Any future date
- **CVV:** Any 3 digits

Proceed by entering dummy details and clicking on the "Pay" button to simulate a successful payment.

To view the tours you have booked, click on your account icon and then select "My Bookings" from the left panel.

For API testing, you can access the Postman collection [here](https://www.postman.com/descent-module-architect-20952764/workspace/tourplatform-rudraksh/collection/31221845-668a155f-af43-4f16-9d33-63ae13785a46?action=share&creator=31221845).

Please note that while several frontend features like signup and admin CRUD operations are not yet implemented, the backend API encompasses essential functionalities such as CRUD operations for tours, users, bookings, and reviews. Additionally, features like preventing duplicate reviews, authentication, filtering, pagination, rate limiting, and more are incorporated into the backend API, aligning with the primary goal of the project.


