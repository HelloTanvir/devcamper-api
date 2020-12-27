production dependencies:
    express
    dotenv      -> this creates environment variables
    morgan      -> this logs request to console
    mongoose    -> link with database
    colors      -> to colorize and style text in console (optional)
    slugify     -> to create slug
    node-geocoder   -> to create GEOJSON (mapquest or alternatives is used to get the api key)
    express-fileupload  -> to upload files (e.g. image)
    jsonwebtoken    -> to send a token to user, which will give access to the protected routes
    bcryptjs    -> to encrypt password
    cookie-parser   -> to save the response token in the cookie
    nodemailer  -> to send reset password email (mailtrap.io is used to trap mail)
    express-mongo-sanitize  -> to prevent nosql injections
            alternate option: mongo-sanitize (have to apply with anything I want to sanitize)
    helmet  -> add some special security headers (XSS protection)
    xss-clean   -> prevent cross site scripting (prevent sending script or any html tag with body)
    express-rate-limit  -> to limit request number in certain time
    hpp -> express middleware to protect against HTTP Parameter Pollution Attacks
    cross   -> to allow other domain to use this domain for api

dev dependencies:
    nodemon

core module:
    crypto  -> to generate token and hash it (to reset password)