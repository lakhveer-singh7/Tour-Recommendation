# Tour Planning and Recommendation System

A smart travel app that helps you discover amazing places, plan perfect trips, and get personalized recommendations. Built with modern web technologies (MongoDB, Express.js, React.js, Node.js).

## Getting Started

### demo video = https://drive.google.com/file/d/1i6Euy4NMozPXaR1ciFUgKCQQ7t6Rm05I/view?usp=sharing

## render deploy link = https://tour-recommendation-frontend.onrender.com

### What You'll Need

Before you start, make sure you have these installed:

-   **Node.js** (version 16 or newer)
-   **npm** (comes with Node.js)
-   **MongoDB Atlas account** (for the database)
-   **Google Cloud Platform account** (for maps and places data)

### Setting Up the Project

#### 1. Navigate to the Project

```bash
cd Tour_Rec
```

#### 2. Set Up the Backend

First, let's get the backend running:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

Create the environment file:

```bash
node createEnv.js
```

This creates a `.env` file with some default settings. You'll need to update it with your own values:

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_here
PORT=5002
```

**Important Notes:**

-   Replace the Google Maps API key with your own
-   Update the MongoDB URI with your Atlas connection string
-   Change the JWT secret to something secure and random

Now start the backend server:

```bash
npm run dev
```

The backend will be running at `http://localhost:5002`

#### 3. Set Up the Frontend

Open a new terminal window and navigate to the frontend:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

Create the frontend environment file:

```bash
# Create .env.local file in frontend directory
echo "REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here" > .env.local
```

Start the frontend development server:

```bash
npm start
```

The frontend will be running at `http://localhost:3000`

### Using the App

1. **Frontend**: Open your browser and go to `http://localhost:3000`
2. **Backend API**: Available at `http://localhost:5002`

## What This App Does

-   **Smart User Management**: Sign up with email or Google account
-   **Discover Places**: Search and explore tourist destinations
-   **Get Recommendations**: Personal suggestions based on your preferences
-   **Plan Perfect Trips**: Create optimized itineraries with route planning
-   **Interactive Maps**: See all your places and routes on beautiful maps
-   **Track Everything**: Keep track of your tours, preferences, and recommendations
-   **Route Optimization**: Automatically find the best route between places
-   **Cost & Time Estimates**: Smart estimates for planning your trips

## 🛠️ Available Commands

#### Backend Commands

```bash
npm run dev    # Start development server with auto-restart
npm start      # Start production server
```

#### Frontend Commands

```bash
npm start      # Start development server
npm build      # Build for production
npm test       # Run tests
```

## 🗄️ Database Setup

We use MongoDB Atlas (a cloud database service). The connection string goes in your `.env` file. The database will be created automatically when you first run the app.

## Setting Up API Keys

#### Google Maps API Key (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or pick an existing one
3. Enable these APIs:
    - **Maps JavaScript API**
    - **Places API**
    - **Directions API**
    - **Geocoding API**
4. Create an API key
5. Put the API key in your backend `.env` file

#### Google OAuth Client ID (Optional - for Google Login)

1. In Google Cloud Console, go to "Credentials"
2. Create an OAuth 2.0 Client ID
3. Add `http://localhost:3000` to authorized origins
4. Add `http://localhost:3000/google-auth-success` to authorized redirect URIs
5. Put the client ID in your frontend `.env.local` file

## Troubleshooting

#### Common Problems

1. **Port already in use**

    ```bash
    # Kill process using port 5002 (backend)
    npx kill-port 5002

    # Kill process using port 3000 (frontend)
    npx kill-port 3000
    ```

2. **MongoDB connection issues**

    - Check your MongoDB URI in the `.env` file
    - Make sure your Atlas cluster is running
    - Check your internet connection
    - Verify your IP is whitelisted in Atlas

3. **Google Maps not loading**

    - Check your API key in the `.env` file
    - Make sure the required APIs are enabled in Google Cloud Console
    - Ensure billing is set up in Google Cloud Console
    - Check if your API key has any restrictions

4. **CORS errors**

    - Backend CORS is set up for `localhost:3000` and `localhost:3005`
    - If you're using different ports, update the CORS settings in `backend/src/server.js`

5. **Authentication problems**
    - Check if JWT_SECRET is set in your `.env` file
    - Verify your Google OAuth client ID if using Google login
    - Check the browser console for authentication errors

#### Package Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
Tour_Rec/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # Database models (User, Place, Plan)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic and external APIs
│   │   ├── utils/           # Helper functions and algorithms
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── createEnv.js         # Environment setup script
├── frontend/
│   ├── src/
│   │   ├── api/             # API service functions
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React context providers (Auth, Tour)
│   │   ├── pages/           # Page components
│   │   ├── services/        # Frontend services
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js   # Tailwind CSS configuration
├── SRS_Document.md          # Software Requirements Specification
└── README.md
```

## Security Features

-   **JWT Authentication**: Secure token-based login system
-   **Password Hashing**: Passwords are encrypted using bcrypt
-   **CORS Protection**: Configured to prevent unauthorized access
-   **Input Validation**: All user inputs are checked and cleaned
-   **API Key Protection**: No API keys are logged in the console

## Deploying Your App

#### Backend Deployment

1. Set up environment variables on your hosting platform
2. Build and deploy the Node.js application
3. Configure CORS for your production domain

#### Frontend Deployment

1. Run `npm run build` to create the production build
2. Deploy the `build` folder to your hosting platform
3. Update API endpoints to point to your production backend

## Need Help?

If you run into any issues:

1. Check the console for error messages
2. Make sure all environment variables are set correctly
3. Ensure all packages are installed
4. Check that all services are running
5. Look through the troubleshooting section above

## License

This project is licensed under the ISC License.

---

**Happy Travel Planning! 🗺️✈️**
