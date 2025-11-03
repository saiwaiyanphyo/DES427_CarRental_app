# 🚗 Car Rental App

A modern, full-stack mobile car rental application built with **Expo** and **Supabase**. This app provides a seamless experience for users to browse, book, and manage car rentals with real-time availability tracking.

## 📖 Overview

The Car Rental App is a cross-platform mobile application that enables users to:
- Create an account and authenticate securely
- Search for available vehicles by date
- Book cars for specific dates with automatic 3-day rental windows
- View and manage their rental bookings
- Browse a fleet of 20+ vehicles with detailed information and images

Built as a demonstration of modern mobile app development practices, this project showcases integration between React Native, Expo Router, and Supabase for authentication, real-time database operations, and serverless functions.

## ✨ Key Features

### 🔐 Authentication
- **Email/Password Authentication**: Secure user registration and login powered by Supabase Auth
- **Session Management**: Persistent authentication state across app launches
- **Protected Routes**: Automatic navigation based on authentication status

### 🚙 Vehicle Management
- **Extensive Fleet**: Pre-seeded database with 20+ vehicles including popular makes and models
- **Vehicle Details**: Each car includes make, model, color, and high-quality images
- **Real-time Availability**: Dynamic availability checking based on existing bookings

### 📅 Booking System
- **Date Selection**: Intuitive date picker for selecting rental start dates
- **Smart Availability**: Real-time search shows only available vehicles for selected dates
- **3-Day Rental Window**: Automatic calculation of expected return dates (booking date + 2 days)
- **Conflict Prevention**: Database-level checks prevent overlapping bookings
- **Booking Confirmation**: Instant booking with renter name capture

### 📱 User Interface
- **Tab Navigation**: Clean bottom tab navigation for easy access to main features
- **Search Screen**: Browse and filter available vehicles by date
- **My Rentals Screen**: View all your current and upcoming bookings
- **Responsive Design**: Optimized for both iOS and Android devices
- **Image Gallery**: Visual car browsing with Unsplash-sourced vehicle images

## 🛠️ Technology Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0.20) - Development platform and tools
- **Expo Router** (~6.0.13) - File-based routing system
- **React Navigation** - Tab and stack navigation
- **TypeScript** (~5.9.2) - Type-safe JavaScript

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Row Level Security (RLS) policies
  - Serverless functions (RPC)
  - Real-time subscriptions
  - Authentication & user management

### Key Libraries
- `@supabase/supabase-js` - Supabase JavaScript client
- `@react-native-community/datetimepicker` - Native date picker
- `expo-secure-store` - Secure credential storage
- `@expo/vector-icons` - Icon library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go App** (for testing on physical devices)
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

### Development Environment
- iOS: macOS with Xcode (for iOS Simulator)
- Android: Android Studio with Android SDK (for Android Emulator)
- Or use **Expo Go** app on your physical device

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/saiwaiyanphyo/DES427_CarRental_app.git
cd DES427_CarRental_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project" and fill in the project details
3. Wait for your project to be provisioned (this may take a few minutes)

#### Initialize the Database
1. In your Supabase project dashboard, navigate to the **SQL Editor**
2. Open the file `scripts/supabase.sql` from this repository
3. Copy the entire SQL script and paste it into the SQL Editor
4. Click "Run" to execute the script

This script will:
- Create the necessary tables (`cars`, `bookings`)
- Set up Row Level Security (RLS) policies
- Create the `available_cars(date)` RPC function
- Seed the database with 20 sample vehicles
- Add demo bookings for testing

#### Configure Environment Variables
1. In your Supabase project, go to **Settings** > **API**
2. Copy your **Project URL** and **anon/public key**
3. Open `app.config.ts` in the repository
4. Update the following values in the `extra` section:

```typescript
extra: {
  EXPO_PUBLIC_SUPABASE_URL: "your-project-url",
  EXPO_PUBLIC_SUPABASE_ANON_KEY: "your-anon-key"
}
```

### 4. Start the Development Server

```bash
npm start
```

This will start the Expo development server and display a QR code in your terminal.

### 5. Run on Device/Simulator

**On Physical Device:**
1. Install **Expo Go** app from App Store (iOS) or Google Play (Android)
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

**On iOS Simulator:**
```bash
npm run ios
```

**On Android Emulator:**
```bash
npm run android
```

**On Web Browser:**
```bash
npm run web
```

## 📁 Project Structure

```
DES427_CarRental_app/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab-based navigation routes
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   └── index.tsx            # Main app entry with auth check
│   ├── _layout.tsx              # Root layout
│   └── modal.tsx                # Modal screens
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── screens/
│   │   ├── AuthScreen.tsx       # Login/signup screen
│   │   ├── SearchScreen.tsx     # Car search and booking
│   │   └── MyRentalsScreen.tsx  # User's rental history
│   └── api.ts                   # API utilities
├── scripts/
│   ├── supabase.sql             # Database schema and seed data
│   └── reset-project.js         # Project reset utility
├── assets/                       # Images, fonts, and static files
├── components/                   # Reusable React components
├── constants/                    # App constants and theme
├── hooks/                        # Custom React hooks
├── app.config.ts                # App configuration (includes Supabase keys)
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

## 💾 Database Schema

### Tables

#### `cars`
Stores the vehicle catalog with details about each car in the fleet.

| Column      | Type   | Description                           |
|-------------|--------|---------------------------------------|
| id          | uuid   | Primary key (auto-generated)          |
| make        | text   | Car manufacturer (e.g., "Toyota")     |
| model       | text   | Car model (e.g., "Camry")            |
| color       | text   | Car color (e.g., "Blue")             |
| image_url   | text   | URL to car image (Unsplash)          |

#### `bookings`
Stores rental bookings with user information and rental dates.

| Column                | Type      | Description                              |
|-----------------------|-----------|------------------------------------------|
| id                    | uuid      | Primary key (auto-generated)             |
| user_id               | uuid      | Foreign key to auth.users                |
| car_id                | uuid      | Foreign key to cars table                |
| booking_date          | date      | Rental start date                        |
| renter_name           | text      | Name of the person renting               |
| expected_return_date  | date      | Calculated return date (start + 2 days)  |
| inserted_at           | timestamp | Booking creation timestamp               |

**Constraints:**
- Unique constraint on `(car_id, booking_date)` prevents double-booking
- Trigger automatically sets `expected_return_date` to `booking_date + 2 days`
- Trigger prevents overlapping bookings within the 3-day rental window

### RPC Functions

#### `available_cars(day date)`
Returns all cars that are not booked on the specified date, considering the 3-day rental window.

**Usage:**
```javascript
const { data, error } = await supabase.rpc('available_cars', { 
  day: '2025-12-15' 
});
```

### Row Level Security (RLS)

- **Cars**: Readable by everyone (unauthenticated and authenticated)
- **Bookings**: 
  - Readable only by the booking owner (`user_id = auth.uid()`)
  - Insertable by any authenticated user

## 🎯 Usage Guide

### First Time Setup
1. **Launch the app** using one of the methods above
2. **Sign Up** with your email and password
3. **Login** with your newly created credentials

### Searching for Cars
1. Navigate to the **Search** tab
2. Tap on the date picker to select your desired rental date
3. Click **Search** to view available vehicles
4. Browse through the list of available cars with images and details

### Booking a Car
1. From the search results, tap **Book** on your desired vehicle
2. Enter your name in the booking confirmation dialog
3. Confirm the booking
4. The car will be reserved for a 3-day period starting from your selected date

### Viewing Your Rentals
1. Navigate to the **My Rentals** tab
2. View all your current and upcoming bookings
3. Each rental shows:
   - Vehicle details (make, model, color)
   - Booking date (rental start date)
   - Expected return date (booking date + 2 days)

### Logging Out
- Tap the **Log out** button in the header (top right) of any screen

## 🔧 Available Scripts

```bash
# Start Expo development server
npm start

# Start for specific platform
npm run android     # Run on Android device/emulator
npm run ios         # Run on iOS device/simulator
npm run web         # Run in web browser

# Code quality
npm run lint        # Run ESLint

# Reset project (removes sample code)
npm run reset-project
```

## 🗺️ Roadmap & Future Enhancements

Potential features for future development:
- ⭐ Car ratings and reviews
- 💳 Payment integration (Stripe/PayPal)
- 📍 Location-based car search
- 🔔 Push notifications for booking reminders
- 📊 Admin dashboard for fleet management
- 🚗 Car categories and filtering
- 💰 Dynamic pricing based on demand
- 📸 User-uploaded vehicle images
- 🌍 Multi-language support
- 📱 Social authentication (Google, Apple)

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Sai Wai Yan Phyo**
- GitHub: [@saiwaiyanphyo](https://github.com/saiwaiyanphyo)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- Vehicle images from [Unsplash](https://unsplash.com/)
- Icons by [Expo Vector Icons](https://icons.expo.fyi/)

## 📞 Support

If you encounter any issues or have questions:
- Open an issue in the GitHub repository
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Supabase documentation](https://supabase.com/docs)

---

**Note**: This is a demonstration project for educational purposes. For production use, additional security measures, error handling, and testing should be implemented.
