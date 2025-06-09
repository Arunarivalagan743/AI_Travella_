import { 
    Explore, 
    AttachMoney, 
    MonetizationOn, 
    Diamond,
    DirectionsBoat,
    CameraAlt,
    EmojiNature,
    Spa,
    Restaurant,
    Person,
    Groups,
    Favorite,
    FamilyRestroom,
    BeachAccess,
    Celebration,
    Museum,
   Snowboarding,
    LocationCity,
    AcUnit
} from '@mui/icons-material';

// Budget options that can be used across travel types
export const BudgetOptions = [
    {
        id: "budget",
        label: "Budget-Friendly",
        icon: <AttachMoney />,
        description: "Affordable options that won't break the bank"
    },
    {
        id: "moderate",
        label: "Moderate",
        icon: <MonetizationOn />,
        description: "Mid-range pricing with good value"
    },
    {
        id: "luxury",
        label: "Luxury",
        icon: <Diamond />,
        description: "Premium experiences with high-end accommodations"
    }
];

export const SelectTravelList = [
        {
                id: "adventure",
                title: "Adventure Trip",
                description: "Explore the great outdoors with thrilling activities",
                icon: <Explore />,
                peopleMax: "6 people",
                features: ["Hiking", "Camping", "Extreme sports"],
                priceRange: "₹20,000 - ₹50,000",
                budgetOptions: ["budget", "moderate"]
        },
      
        {
                id: "luxury",
                title: "Luxury Escape",
                description: "Indulge in premium experiences and accommodations",
                icon: <Diamond />,
                peopleMax: "4 people",
                features: ["5-star stays", "VIP access", "Premium services"],
                priceRange: "₹75,000 - ₹200,000",
                budgetOptions: ["luxury"]
        },
        
        {
                id: "cultural",
                title: "Cultural Immersion",
                description: "Experience the authentic local culture and history",
                icon: <Museum />,
                peopleMax: "8 people",
                features: ["Historical sites", "Local cuisine", "Cultural performances"],
                priceRange: "₹25,000 - ₹60,000",
                budgetOptions: ["budget", "moderate", "luxury"]
        },
        
        {
                id: "romantic",
                title: "Romantic Getaway",
                description: "Perfect escapes for couples looking to reconnect",
                icon: <Favorite />,
                peopleMax: "2 people",
                features: ["Private dinners", "Couple's activities", "Scenic views"],
                priceRange: "₹30,000 - ₹80,000",
                budgetOptions: ["moderate", "luxury"]
        },
        
        {
                id: "family",
                title: "Family Vacation",
                description: "Fun for the whole family with activities for all ages",
                icon: <FamilyRestroom />,
                peopleMax: "10 people",
                features: ["Kid-friendly", "Educational experiences", "Family accommodations"],
                priceRange: "₹35,000 - ₹70,000",
                budgetOptions: ["budget", "moderate", "luxury"]
        },
        
        {
                id: "beach",
                title: "Beach Holiday",
                description: "Relax and unwind on beautiful sandy beaches",
                icon: <BeachAccess />,
                peopleMax: "8 people",
                features: ["Oceanfront stays", "Water sports", "Sunbathing"],
                priceRange: "₹25,000 - ₹65,000",
                budgetOptions: ["budget", "moderate", "luxury"]
        },
        
        {
                id: "wellness",
                title: "Wellness Retreat",
                description: "Focus on health, relaxation and rejuvenation",
                icon: <Spa />,
                peopleMax: "4 people",
                features: ["Spa treatments", "Yoga", "Mindfulness activities"],
                priceRange: "₹40,000 - ₹100,000",
                budgetOptions: ["moderate", "luxury"]
        },
        
        {
                id: "food",
                title: "Culinary Tour",
                description: "Discover amazing cuisines and food experiences",
                icon: <Restaurant />,
                peopleMax: "6 people",
                features: ["Cooking classes", "Food tours", "Restaurant experiences"],
                priceRange: "₹30,000 - ₹75,000",
                budgetOptions: ["moderate", "luxury"]
        },
        
        {
                id: "group",
                title: "Group Travel",
                description: "Perfect for friends, colleagues or special interest groups",
                icon: <Groups />,
                peopleMax: "20 people",
                features: ["Group activities", "Shared experiences", "Team building"],
                priceRange: "₹15,000 - ₹40,000 per person",
                budgetOptions: ["budget", "moderate"]
        },
        
        {
                id: "solo",
                title: "Solo Travel",
                description: "Independent adventures for the solo traveler",
                icon: <Person />,
                peopleMax: "1 person",
                features: ["Safety focused", "Social opportunities", "Self-discovery"],
                priceRange: "₹18,000 - ₹60,000",
                budgetOptions: ["budget", "moderate", "luxury"]
        },
        
        {
                id: "festival",
                title: "Festival & Events",
                description: "Plan your trip around exciting cultural or music festivals",
                icon: <Celebration />,
                peopleMax: "8 people",
                features: ["Event tickets", "Special accommodations", "VIP options"],
                priceRange: "₹25,000 - ₹70,000",
                budgetOptions: ["budget", "moderate", "luxury"]
        },
        
        {
                id: "urban",
                title: "Urban Exploration",
                description: "Discover the energy and attractions of vibrant cities",
                icon: <LocationCity />,
                peopleMax: "6 people",
                features: ["City tours", "Museum passes", "Local nightlife"],
                priceRange: "₹22,000 - ₹65,000",
                budgetOptions: ["budget", "moderate", "luxury"]
        },
        
        {
                id: "nature",
                title: "Nature Retreat",
                description: "Connect with the natural world in beautiful settings",
                icon: <EmojiNature />,
                peopleMax: "8 people",
                features: ["Wildlife viewing", "Natural wonders", "Eco-friendly stays"],
                priceRange: "₹18,000 - ₹55,000",
                budgetOptions: ["budget", "moderate"]
        },
        
        {
                id: "photography",
                title: "Photography Tour",
                description: "Capture stunning landscapes and unique moments",
                icon: <CameraAlt />,
                peopleMax: "6 people",
                features: ["Photo guides", "Perfect locations", "Equipment rentals"],
                priceRange: "₹28,000 - ₹70,000",
                budgetOptions: ["moderate", "luxury"]
        },
        
        {
                id: "cruise",
                title: "Cruise Experience",
                description: "Enjoy the luxury and convenience of traveling by sea",
                icon: <DirectionsBoat />,
                peopleMax: "4 people",
                features: ["All-inclusive", "Multiple destinations", "Onboard entertainment"],
                priceRange: "₹45,000 - ₹120,000",
                budgetOptions: ["moderate", "luxury"]
        },
        
     {
    id: "winter",
    title: "Winter Holiday",
    description: "Experience the magic of snow and winter activities",
    icon: <Snowboarding />,   // corrected here
    peopleMax: "6 people",
    features: ["Skiing/Snowboarding", "Cozy lodges", "Winter landscapes"],
    priceRange: "₹35,000 - ₹90,000",
    budgetOptions: ["moderate", "luxury"]
},
    ]