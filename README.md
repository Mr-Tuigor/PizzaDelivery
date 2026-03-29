## Yet to complete

Pizza builder app for Pizza Delivery Services
Here you can choose the ingredients for you pizza and choose the cheapest pizza possible by comparing the price of each ingredients.

<img width="1920" height="1020" alt="Screenshot 2026-03-29 195640" src="https://github.com/user-attachments/assets/2bb2c7aa-a3a1-4481-981b-36796caf0a6a" />

<img width="1920" height="1020" alt="Screenshot 2026-03-29 195655" src="https://github.com/user-attachments/assets/a5f77719-05ac-4186-80f2-d658e872303a" />

<img width="1920" height="1020" alt="Screenshot 2026-03-29 195717" src="https://github.com/user-attachments/assets/9cc15521-b4ef-4de7-9030-1aa4c42a7105" />

<img width="1920" height="1020" alt="Screenshot 2026-03-29 195823" src="https://github.com/user-attachments/assets/a8ce183a-00fa-4639-8c77-c76701746591" />

<img width="1920" height="1020" alt="Screenshot 2026-03-29 195836" src="https://github.com/user-attachments/assets/89e7b28a-f1b4-4b6f-b62c-628f7273716e" />

<img width="1920" height="1020" alt="Screenshot 2026-03-29 195904" src="https://github.com/user-attachments/assets/0da5b79a-0bb3-4948-a22b-127f5da6d73a" />


# want to run this on you machine? follow the below steps

Step 1: Clone the project\
Step 2: create 2 terminals on first: "cd backendForPD", On second: "cd frontendForPD"\
Step 3: "npm i" on both the terminal\
Step 4: create ".env" file on backend folder and add these fields:\

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
