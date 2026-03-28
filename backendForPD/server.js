const express = require('express');
const app = express();
const port = 3000;

const connectDB = require('./config/mongooseConfig.js');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();
connectDB();

app.use(cors({
  origin: true,
  credentials: true
}));
// app.options("*", cors()); // throwing errors
console.log("CLIENT_URL:", process.env.CLIENT_URL);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/pizza', pizzaRoutes);
app.use("/api/orders", orderRoutes)


app.get('/', (req, res) => {
  res.send('backend is running');
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

