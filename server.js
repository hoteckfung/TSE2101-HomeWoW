const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // assuming your static files are in a directory named 'public'

mongoose.connect('mongodb://localhost:27017/homewow')
  .then(() => console.log('Connected to Database'))
  .catch(err => console.error(err));
// Define a schema
const Schema = mongoose.Schema;
const mySchema = new Schema({}, { strict: false }); // Use an empty schema as an example

const session = require('express-session');

app.use(session({
  secret: 'chicken',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: a secure cookie requires an HTTPS connection
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// Create a model for the 'user' collection
const UserModel = mongoose.model('user', mySchema);

// Create a model for the 'property' collection
const PropertyModel = mongoose.model('property', mySchema);

// Create a model for the 'agreement' collection
const AgreementSchema = new mongoose.Schema({
  tenantName: String,
  date: Date,
  propertyName: String,
  propertyId: mongoose.Schema.Types.ObjectId,
  ownerId: mongoose.Schema.Types.ObjectId,
  status: String
});

const Agreement = mongoose.model('Agreement', AgreementSchema);


app.get('/users', (req, res) => {
  UserModel.find()
  .then(results => {
    res.json(results);
  })
  .catch(error => console.error(error));
});

class User {
  constructor(id, name, email, userType) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.userType = userType;
  }
}

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ email: email })
    .then(user => {
      if (!user || password !== user.password) { // Note: In a real application, never store passwords in plain text
        res.redirect('/login.html?loginError=Invalid email or password');
      } else {
        const loggedInUser = new User(user._id, user.name, user.email, user.userType);
        req.session.user = loggedInUser;
        console.log(loggedInUser);

        // Check the userType and redirect accordingly
        if (user.userType === 'tenant') {
          res.redirect(`/tenant.html?username=${user.name}&userType=${user.userType}&id=${user._id}`);
        }
        else if (user.userType === 'Owner/Agent') {
          res.redirect(`/owner-agent.html?username=${user.name}&userType=${user.userType}&id=${user._id}`);
        }
        else if (user.userType === 'Admin'){
          res.redirect(`/admin-dashboard.html?username=${user.name}&userType${user.userType}&userId=${user.id}`);
        }
      }
    })
    .catch(error => console.error(error));
});

app.post('/signup', (req, res) => {
  const { name, password, email, icNum, phone, gender, userType } = req.body;

  const newUser = new UserModel({ name, password, email, icNum, phone, gender, userType });

  newUser.save()
    .then(() => res.redirect('/login.html'))
    .catch(error => console.error(error));
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return console.log(err);
    }
    console.log("Logout successful");
    res.redirect('/index.html');
  });
});

app.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

app.use(express.json());

app.post('/update-profile', (req, res) => {
  const { id, name, email, phone } = req.body;

  console.log(`Updating profile for user with id: ${id}`);

  UserModel.findOneAndUpdate({ _id: id }, { name, email, phone }, { new: true })
    .then(user => {
        if (!user) {
            console.log(`No user found with id: ${id}`);
            res.status(404).json({ message: 'User not found' });
        } else {
            console.log(`Updated profile for user with id: ${id}`);
            res.json({ message: 'Profile updated successfully' });
        }
    })
    .catch(error => console.error(`Error updating user: ${error}`));
});

app.post('/change-password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  UserModel.findById(id)
    .then(user => {
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        throw new Error('User not found'); // Stop execution if user is not found
      } else if (user.password !== currentPassword) {
        res.status(401).json({ message: 'Current password is incorrect' });
        throw new Error('Current password is incorrect'); // Stop execution if password is incorrect
      } else {
        return UserModel.findByIdAndUpdate(id, { password: newPassword }, { new: true });
      }
    })
    .then(() => res.json({ message: 'Password changed successfully' }))
    .catch(error => console.error(`Error changing password: ${error}`));
});

// Add a new route to handle the POST request
app.post('/add-property', (req, res) => {
  const property = new PropertyModel(req.body);
  property.save()
    .then(() => {
      res.json({ message: 'Property added successfully' });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});


app.get('/properties', async (req, res) => {
  try {
      const userId = req.query.userId;
      let properties;
      if (userId) {
          properties = await PropertyModel.find({ userId: userId });
      } else {
          properties = await PropertyModel.find();
      }
      res.json(properties);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/properties/:id', async function(req, res) {
  const id = req.params.id;

  try {
      await PropertyModel.deleteOne({ _id: id });
      res.status(200).send({ message: 'Property was deleted successfully' });
  } catch (err) {
      res.status(500).send({ error: 'There was an error deleting the property' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const result = await UserModel.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/properties/:id/agreement-request', (req, res) => {
  const { username, date } = req.body;

  PropertyModel.findById(req.params.id)
      .then(property => {
          if (!property) {
              console.log(`Property with ID ${req.params.id} not found`);
              return res.status(404).send('Property not found');
          }

          const agreement = new Agreement({
              tenantName: username,
              date: new Date(date),
              propertyName: property.name,
              propertyId: property._id,
              ownerId: property.userId,
              status: 'Pending'
          });

          return agreement.save();
      })
      .then(() => res.send('Agreement request sent!'))
      .catch(err => {
          console.error('There was an error processing the agreement request', err);
          res.status(500).send('There was an error processing the agreement request');
      });
});

app.put('/properties/:id', async (req, res) => {
  const { name, location, price, description, bedroom, bathroom, ownerName } = req.body;

  try {
      const property = await PropertyModel.findByIdAndUpdate(
          req.params.id,
          { name, location, price, description, bedroom, bathroom, ownerName },
          { new: true, useFindAndModify: false }
      );

      if (!property) {
          return res.status(404).json({ success: false, message: 'Property not found' });
      }

      res.json({ success: true, message: 'Property updated successfully', property });
  } catch (err) {
      console.error('There was an error updating the property:', err);
      res.status(500).json({ success: false, message: 'There was an error updating the property' });
  }
});

app.put('/propertiesAdmin/:id', async (req, res) => {
  const { name, location, price, description, bedroom, bathroom } = req.body;

  try {
      const property = await PropertyModel.findByIdAndUpdate(
          req.params.id,
          { name, location, price, description, bedroom, bathroom },
          { new: true, useFindAndModify: false }
      );

      if (!property) {
          return res.status(404).json({ success: false, message: 'Property not found' });
      }

      res.json({ success: true, message: 'Property updated successfully', property });
  } catch (err) {
      console.error('There was an error updating the property:', err);
      res.status(500).json({ success: false, message: 'There was an error updating the property' });
  }
});

// Get all agreements
app.get('/agreements', async (req, res) => {
  try {
      const ownerId = req.query.ownerId;
      const agreements = await Agreement.find({ ownerId: ownerId });
      res.json(agreements);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

//Accept agreement
app.put('/agreements/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Update the status of the agreement in the database
  Agreement.findByIdAndUpdate(id, { status: status }, { new: true })
      .then(() => {
          // If successful, return a 200 status
          res.sendStatus(200);
      })
      .catch(error => {
          // If an error occurred, return a 500 status
          console.error(error);
          res.status(500).send('An error occurred');
      });
});

// Delete an agreement
app.delete('/agreements/:id', (req, res) => {
  const agreementId = req.params.id;

  Agreement.deleteOne({ _id: agreementId })
      .then(() => {
          res.status(200).send({ message: 'Agreement deleted successfully.' });
      })
      .catch((err) => {
          res.status(500).send({ message: 'An error occurred while deleting the agreement.' });
      });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});