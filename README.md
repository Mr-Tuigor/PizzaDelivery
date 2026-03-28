## Yet to complete

Pizza builder app for Pizza Delivery Services
Here you can choose the ingredients for you pizza and choose the cheapest pizza possible by comparing the price of each ingredients.

# want to run this on you machine? follow the below steps

Step 1: Clone the project
Step 2: create 2 terminals on first: "cd backendForPD", On second: "cd frontendForPD"
Step 3: "npm i" on both the terminal
Step 4: create ".env" file on backend folder and add these fields:

    JWT_SECRET="securet_kiwi"
    JWT_EXPIRE=60d
    NODE_ENV=development

    # if you have mongoDB compass then pasting exactly same url works
    MONGO_URI=mongodb://127.0.0.1:27017/PDservice
    CLIENT_URL=http://localhost:8080

    #If you want to enable the email features(not fully completed)
    #Use only if you have created the emailjs account.
    EMAILJS_SERVICE_ID={your_Service_Id}
    EMAILJS_TEMPLATE_ID={your_Template_Id}
    EMAILJS_PUBLIC_KEY={your_Public_Key}
    EMAILJS_PRIVATE_KEY={your_Private_Key}
Step 5: run "npm run dev" on both(or "npm run start for backend for [nodemon]") the backend and frontend folder terminal
