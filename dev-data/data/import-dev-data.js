const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('../../models/reviewModel');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {}).then(() => console.log('DB connection successful!'));

// READ JSON FILE
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/br/reviews.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/br/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/br/users.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Review.create(reviews);
    await Tour.create(tours);
    await User.create(users);
    console.log('Data upada com sucesso');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Review.deleteMany();
    await Tour.deleteMany();
    await User.deleteMany();
    console.log('Data deletada com sucesso');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
