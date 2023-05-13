const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});
async function getIataCode(city) {
  const apiUrl = `http://api.aviationedge.com/v2/public/cityDatabase?key=${process.env.API_KEY}&codeIso2Country=IN&q=${city}`;
  const response = await axios.get(apiUrl);
  const cityData = response.data[0];
  return cityData ? cityData.codeIataCity : null;
}

app.post('/rates', async (req, res) => {
  const access_key = process.env.API_KEY; 
  const { source, destination, date } = req.query;
  const sourceIata = await getIataCode(source);
  const destIata = await getIataCode(destination);

  try {
    const apiUrl = `http://api.aviationedge.com/v2/public/routes?key=${access_key}&departureIata=${sourceIata}&arrivalIata=${destIata}&flight_date=${date}`;
    const response = await axios.get(apiUrl);
    const flights = response.data;

    const prices = {};
    flights.forEach((flight) => {
      prices[flight.airline.name] = `₹${flight.price}`;
    });

    res.render('rates', {prices});
  } catch (error) {
    console.error(error);
    res.status(500).send('Oops! Something went wrong.');
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
