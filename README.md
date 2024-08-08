## MVP Features
### Landing Page
- User Login Selection: Display a list of users that can log in.
- Button for each user to log in as either Admin or Employee.
### User Dashboard (Employee)
- Gate Status: View the status of all parking gates (Open/Closed).
- Parking Availability: View available parking spots.
- Parking Simulation:
  - Simulate parking in a spot.
  - Receive notifications when parking is limited or full.
  - Simulate leaving a parking spot.
  - Parking Location: View current parking location (Level and Space).
- Logout: Log out and return to the landing page.


### Admin Dashboard
- Manage Users:
  - View list of users.
  - Add new users.
  - Edit existing users.
  - Delete users.
  - Manage Gates: Update the status of parking gates (Open/Closed).
  -  Logout: Log out and return to the landing page.
  
Components 
- LandingPage: User selection for login.
- UserDashboard: Dashboard for employees with parking functionalities.
- AdminDashboard: Dashboard for admin with user and gate management functionalities.
- Alerts: Component to display notifications.
- ConfirmationModal: Modal for confirming actions (e.g., deleting a user).
- AddUserModal: Modal for adding new users.
- EditUserModal: Modal for editing existing users.
- GateList: List of gates with status and toggle functionality.
- ParkingSimulation: Component for simulating parking actions.

```
src/
|-- components/
|   |-- LandingPage.jsx
|   |-- UserDashboard.jsx
|   |-- AdminDashboard.jsx
|   |-- Alerts.jsx
|   |-- ConfirmationModal.jsx
|   |-- AddUserModal.jsx
|   |-- EditUserModal.jsx
|   |-- GateList.jsx
|   |-- ParkingSimulation.jsx
|-- services/
|   |-- api.js
|-- App.jsx
|-- index.js
```
### Step-by-Step Implementation
1. Set up the basic structure of the app in App.jsx with routing.
2. Implement the LandingPage component:
   - Display a list of users to log in as. 
   - Handle user selection and navigation to the appropriate dashboard.
3. Create the UserDashboard component:
   - Display gate status and available parking spots.
   - Implement parking simulation functionalities.
   - Show notifications for parking status.
   - Include logout functionality.
4. Create the AdminDashboard component:
   - Display list of users.
   - Implement functionalities to add, edit, and delete users.
   - Display gate list and allow updating gate status.
   - Include logout functionality.
5. Develop the Alerts component to show notifications.
6. Create the ConfirmationModal component for action confirmations.
7. Develop AddUserModal and EditUserModal components for user management.
8. Implement the GateList component to manage gate statuses.
9. Create the ParkingSimulation component for simulating parking actions.\

---
# Getting Started with Lowes Parking App UI

This project is the front-end for the Lowes Parking App, bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setting Up the Project

To get started with the Lowes Parking App UI, follow these steps:

### 1. Clone the Repository

Clone the project from GitHub to your local machine using the following command:

```
git clone https://github.com/your-username/lowes-parking-app-ui.git
```
```
cd lowes-parking-app-ui
```
### 2. Install Dependencies
Before running the project, make sure to install all the necessary dependencies:

```npm install```
### 3. Start the Development Server
You can start the app in development mode with the following command:

```npm start```

This will run the app in development mode. Open http://localhost:3000 to view it in your browser. The page will reload when you make changes, and you may also see any lint errors in the console.

Available Scripts
In the project directory, you can run the following scripts:

```npm start```

Runs the app in development mode.
Open http://localhost:3000 to view it in your browser.

```npm test```
Launches the test runner in interactive watch mode.
See the section about running tests for more information.

```npm run build```
Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified, and the filenames include the hashes. Your app is ready to be deployed!

```npm run eject```
Note: This is a one-way operation. Once you eject, you can't go back!
