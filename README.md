# 🌍 AI Travella - Intelligent Travel Planning Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://ai-travella-duag.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.8-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.0-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**AI Travella** is a cutting-edge travel planning platform that leverages artificial intelligence to create personalized travel itineraries. Using Google's Gemini AI, the platform generates comprehensive travel plans tailored to your preferences, budget, and travel style. With integrated social features, users can share trips, follow fellow travelers, and build a community of like-minded explorers.

🌐 **Live Site**: [https://travellai.me/](https://travellai.me/)

## 🌟 Key Features

### 🤖 AI-Powered Trip Planning
- **Intelligent Itinerary Generation**: Uses Google Gemini AI to create detailed day-by-day travel plans
- **Personalized Recommendations**: Tailored suggestions based on travel type, budget, and group size
- **Smart Destination Analysis**: Comprehensive destination insights including weather, safety, and local transport
- **AI Travel Assistant**: Chat with a specialized travel assistant for destination insights and trip planning guidance

### 🎯 Travel Customization
- **15+ Travel Types**: Adventure, luxury, cultural, romantic, family, beach, wellness, culinary, and more
- **Flexible Duration**: Support for 1-5 day trips with detailed daily planning
- **Budget-Aware Planning**: Recommendations that fit your budget constraints
- **Group Size Optimization**: Plans adapted for solo travelers to large groups (up to 20 people)

### 🏨 Comprehensive Travel Information
- **Hotel Recommendations**: 5 curated hotel options with ratings, amenities, and pricing
- **Detailed Itineraries**: Day-wise place recommendations with opening hours, ticket prices, and best visit times
- **Transportation Guidance**: Local transport options and cost estimates
- **Weather Forecasting**: Daily weather predictions and packing recommendations
- **Safety Information**: Location-specific precautions and emergency contacts

### 💬 Social Features & Community
- **User Profiles**: Create and customize your traveler profile
- **Follow System**: Connect with other travelers through a follow/unfollow system
- **Trip Sharing**: Share your trips with followers or publicly
- **Social Interactions**: Like, comment, and save trips from other users
- **Real-time Messaging**: Chat with followers and share trip recommendations
- **Trip Discovery**: Explore trending and recently created trips from the community
- **Follow Requests**: Privacy controls with follow request management

### 🔐 User Management & Data Persistence
- **Google OAuth Integration**: Secure sign-in with Google accounts
- **Cloud Storage**: Trip data stored securely in Firebase Firestore
- **Trip Management**: Save, view, edit, and delete your travel plans
- **Favorites System**: Mark and organize your favorite trips
- **PDF Export**: Download your itineraries as professional PDF documents
- **Privacy Controls**: Make trips public or keep them private

### 📱 Modern User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive UI**: Smooth animations powered by Framer Motion
- **Real-time Image Integration**: Destination photos via Google Places API
- **Progressive Form Design**: Intuitive multi-step trip creation process
- **Real-time Updates**: Live notifications for social interactions

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks and context
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Framer Motion 12.16.0** - Smooth animations and transitions
- **React Router DOM 7.6.2** - Client-side routing

### Backend & APIs
- **Google Gemini AI** - Advanced language model for trip generation
- **Google Places API** - Location data and photos
- **Google OAuth** - Secure user authentication
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Hosting** - Static site hosting

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing
- **Vercel** - Deployment and hosting platform

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Google Cloud Platform account for API keys
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TravellaAI.git
   cd TravellaAI/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the frontend directory with the following variables:
   ```env
   # Google APIs
   VITE_GOOGLE_PLACE_API_KEY=your_google_places_api_key
   VITE_GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GOOGLE_AUTH_CLIENT_ID=your_google_oauth_client_id

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application in action.

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── logo.jpg
│   └── wired-outline-2026-gdansk-city-hover-pinch.gif
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.jsx
│   │   └── ui/
│   │       └── custom/
│   │           ├── Header.jsx
│   │           ├── Footer.jsx
│   │           ├── Hero.jsx
│   │           ├── Loading.jsx
│   │           └── WelcomeMessage.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   └── MyTrips.jsx
│   ├── trip-maker/
│   │   └── index.jsx
│   ├── show_trip/
│   │   ├── components/
│   │   │   ├── HotelList.jsx
│   │   │   ├── Information.jsx
│   │   │   ├── ItineraryPlaces.jsx
│   │   │   └── TripSummary.jsx
│   │   └── trip_id/
│   │       └── index.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── ModelWork/
│   │   ├── AiSetup.jsx
│   │   ├── firebaseConfig.js
│   │   └── GlobalApi.jsx
│   ├── choices/
│   │   └── SelectTravelList.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Key Components

### Trip Creation Flow
1. **Destination Selection** - Google Places autocomplete for location picking
2. **Duration Setting** - Flexible 1-5 day trip planning
3. **Travel Type Selection** - 15+ predefined travel styles
4. **Budget & Group Settings** - Custom budget input and traveler count
5. **AI Generation** - Gemini AI creates comprehensive itinerary
6. **Review & Save** - View, edit, and save generated plans
7. **Social Sharing** - Share your trip with followers or make it public

### AI Integration
- **Prompt Engineering**: Carefully crafted prompts for optimal AI responses
- **JSON Validation**: Robust parsing and validation of AI-generated content
- **Error Handling**: Graceful fallbacks for API failures
- **Response Processing**: Intelligent data structure normalization
- **Conversational AI**: Interactive travel assistant chat functionality

### Authentication & Storage
- **Context-based Auth**: React Context for global user state management
- **Firebase Integration**: Secure data persistence and real-time sync
- **Trip Management**: CRUD operations for user trips
- **Data Privacy**: User-specific data isolation and security
- **Real-time Database**: Live updates for social interactions and chat

### Social Connectivity
- **Follow Management**: System for connecting with other travelers
- **Messaging System**: Real-time chat with followers
- **Notifications**: Activity updates for social interactions
- **Trip Sharing**: Share trips privately with followers or publicly with everyone
- **Content Discovery**: Explore trending trips and popular destinations

## 🌐 Live Demo

Experience AI Travella in action: **[https://travellai.me/](https://travellai.me/)**

### Demo Features
- ✅ Create sample trips without registration
- ✅ Explore different travel types and destinations
- ✅ View AI-generated itineraries and hotel recommendations
- ✅ Test responsive design across devices
- ✅ Experience smooth animations and interactions
- ✅ Chat with AI travel assistant
- ✅ Browse public trips from community members
- ✅ Create account and connect with other travelers

## 🤝 Contributing

We welcome contributions to make AI Travella even better! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Areas for Contribution
- 🎨 UI/UX improvements
- 🌍 Additional travel types and categories
- 🔧 Performance optimizations
- 🧪 Test coverage improvements
- 📚 Documentation enhancements
- 🌐 Internationalization support
- 💬 Enhanced social features and chat functionality
- 📊 Analytics dashboard for trip engagement
- 🗺️ Interactive trip maps and visualization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful travel plan generation
- **Google Places API** for location data and imagery
- **Firebase** for reliable backend infrastructure
- **Tailwind CSS** for beautiful, responsive design
- **Framer Motion** for smooth animations
- **React ecosystem** for robust frontend development

## 📞 Support & Contact

- 🌐 **Live Demo**: [https://travellai.me/](https://travellai.me/)
- 💻 **Developer Portfolio**: [https://www.404arunfound.me](https://www.404arunfound.me)
- 📧 **Email**: [Contact via portfolio](https://www.404arunfound.me)

---

**Made with ❤️ and ☕ by Arun** | *Transforming travel planning with AI*
