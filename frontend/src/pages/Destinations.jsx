import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Search, Navigation, Camera, Mountain, Waves, TreePine, Building } from 'lucide-react';

// Helper function for Haversine distance (straight-line distance)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const Destinations = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories for filtering
  const categories = [
    'all',
    'monuments',
    'beaches',
    'mountains',
    'historical',
    'religious',
    'adventure',
    'wildlife',
    'hill stations',
    'backwaters',
    'desert',
    'lakes',
    'waterfalls',
    'national parks',
    'temples',
    'forts',
    'palaces',
    'islands',
    'gardens'
  ];

  // Countries list
  const countries = [
    'all',
    'India',
    'United States',
    'United Kingdom',
    'France',
    'Italy',
    'Japan',
    'Thailand'
  ];

  // Comprehensive list of 30+ travel destinations
  const destinationsData = [
    // Indian Monuments
    {
      id: 1,
      name: 'Taj Mahal',
      city: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India',
      category: 'monuments',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
      description: 'Iconic white marble mausoleum and UNESCO World Heritage Site, symbol of eternal love',
      averageCost: { budget: 500, midRange: 2000, luxury: 5000 },
      bestTimeToVisit: 'October to March',
      rating: 4.9,
      suggestedDuration: '3-4 hours',
      highlights: ['Sunrise view', 'Marble inlay work', 'Charbagh gardens'],
      coordinates: { lat: 27.1751, lng: 78.0421 }
    },
    {
      id: 2,
      name: 'Red Fort',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      category: 'historical',
      image: 'https://images.unsplash.com/photo-1597149543321-b6e31a1e0d75?w=800&h=600&fit=crop',
      description: 'Historic fortified palace and UNESCO World Heritage Site from Mughal era',
      averageCost: { budget: 300, midRange: 1200, luxury: 3000 },
      bestTimeToVisit: 'October to March',
      rating: 4.6,
      suggestedDuration: '2-3 hours',
      highlights: ['Diwan-i-Khas', 'Sound & Light Show', 'Mughal architecture'],
      coordinates: { lat: 28.6562, lng: 77.2410 }
    },
    {
      id: 3,
      name: 'Gateway of India',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      category: 'monuments',
      image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=600&fit=crop',
      description: 'Iconic arch monument overlooking the Arabian Sea, built during British era',
      averageCost: { budget: 0, midRange: 500, luxury: 1000 },
      bestTimeToVisit: 'November to February',
      rating: 4.5,
      suggestedDuration: '1-2 hours',
      highlights: ['Harbor views', 'Elephanta Caves ferry', 'Street food'],
      coordinates: { lat: 18.9220, lng: 72.8347 }
    },
    // Beaches
    {
      id: 4,
      name: 'Goa Beaches',
      city: 'Panaji',
      state: 'Goa',
      country: 'India',
      category: 'beaches',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
      description: 'Paradise beaches with golden sand, palm trees, and vibrant nightlife',
      averageCost: { budget: 1500, midRange: 4000, luxury: 10000 },
      bestTimeToVisit: 'November to February',
      rating: 4.7,
      suggestedDuration: '3-5 days',
      highlights: ['Water sports', 'Beach shacks', 'Portuguese heritage'],
      coordinates: { lat: 15.2993, lng: 74.1240 }
    },
    {
      id: 5,
      name: 'Andaman Islands',
      city: 'Port Blair',
      state: 'Andaman & Nicobar',
      country: 'India',
      category: 'islands',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop',
      description: 'Pristine tropical islands with crystal clear waters and coral reefs',
      averageCost: { budget: 3000, midRange: 8000, luxury: 20000 },
      bestTimeToVisit: 'November to April',
      rating: 4.8,
      suggestedDuration: '5-7 days',
      highlights: ['Scuba diving', 'Radhanagar Beach', 'Cellular Jail'],
      coordinates: { lat: 11.7401, lng: 92.6586 }
    },
    // Mountains & Hill Stations
    {
      id: 6,
      name: 'Manali',
      city: 'Manali',
      state: 'Himachal Pradesh',
      country: 'India',
      category: 'hill stations',
      image: 'https://images.unsplash.com/photo-1606044966902-c4894cf75fa0?w=800&h=600&fit=crop',
      description: 'Scenic hill station in Himalayas perfect for adventure and relaxation',
      averageCost: { budget: 2000, midRange: 5000, luxury: 12000 },
      bestTimeToVisit: 'March to June, September to November',
      rating: 4.6,
      suggestedDuration: '4-5 days',
      highlights: ['Rohtang Pass', 'Solang Valley', 'Adventure sports'],
      coordinates: { lat: 32.2396, lng: 77.1887 }
    },
    {
      id: 7,
      name: 'Shimla',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      country: 'India',
      category: 'hill stations',
      image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop',
      description: 'Queen of Hills with colonial architecture and scenic toy train rides',
      averageCost: { budget: 1800, midRange: 4500, luxury: 10000 },
      bestTimeToVisit: 'March to June, September to November',
      rating: 4.4,
      suggestedDuration: '3-4 days',
      highlights: ['Mall Road', 'Toy train', 'Colonial buildings'],
      coordinates: { lat: 31.1048, lng: 77.1734 }
    },
    // Desert
    {
      id: 8,
      name: 'Jaisalmer',
      city: 'Jaisalmer',
      state: 'Rajasthan',
      country: 'India',
      category: 'desert',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop',
      description: 'Golden City in Thar Desert with magnificent sandstone architecture',
      averageCost: { budget: 1500, midRange: 4000, luxury: 12000 },
      bestTimeToVisit: 'October to March',
      rating: 4.7,
      suggestedDuration: '2-3 days',
      highlights: ['Camel safari', 'Sand dunes', 'Jaisalmer Fort'],
      coordinates: { lat: 26.9157, lng: 70.9083 }
    },
    // Religious Sites
    {
      id: 9,
      name: 'Varanasi',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India',
      category: 'religious',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop',
      description: 'Spiritual capital of India with ancient ghats along the Ganges River',
      averageCost: { budget: 800, midRange: 2500, luxury: 6000 },
      bestTimeToVisit: 'October to March',
      rating: 4.5,
      suggestedDuration: '2-3 days',
      highlights: ['Ganga Aarti', 'Boat ride', 'Ancient temples'],
      coordinates: { lat: 25.3176, lng: 82.9739 }
    },
    {
      id: 10,
      name: 'Golden Temple',
      city: 'Amritsar',
      state: 'Punjab',
      country: 'India',
      category: 'religious',
      image: 'https://images.unsplash.com/photo-1586150395236-1dff86db47bb?w=800&h=600&fit=crop',
      description: 'Holiest Sikh shrine with stunning golden architecture and serene lake',
      averageCost: { budget: 600, midRange: 2000, luxury: 5000 },
      bestTimeToVisit: 'October to March',
      rating: 4.9,
      suggestedDuration: '1-2 days',
      highlights: ['Golden dome', 'Langar service', 'Evening prayers'],
      coordinates: { lat: 31.6200, lng: 74.8765 }
    },
    // Wildlife & National Parks
    {
      id: 11,
      name: 'Jim Corbett National Park',
      city: 'Nainital',
      state: 'Uttarakhand',
      country: 'India',
      category: 'wildlife',
      image: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop',
      description: 'India\'s oldest national park famous for Bengal tigers and diverse wildlife',
      averageCost: { budget: 3000, midRange: 8000, luxury: 20000 },
      bestTimeToVisit: 'November to June',
      rating: 4.6,
      suggestedDuration: '2-3 days',
      highlights: ['Tiger safari', 'Bird watching', 'Nature walks'],
      coordinates: { lat: 29.5316, lng: 78.9487 }
    },
    {
      id: 12,
      name: 'Ranthambore National Park',
      city: 'Sawai Madhopur',
      state: 'Rajasthan',
      country: 'India',
      category: 'wildlife',
      image: 'https://images.unsplash.com/photo-1605024358860-24c83e7dffbd?w=800&h=600&fit=crop',
      description: 'Former royal hunting ground now famous for tiger sightings and historic fort',
      averageCost: { budget: 2500, midRange: 6000, luxury: 15000 },
      bestTimeToVisit: 'October to April',
      rating: 4.5,
      suggestedDuration: '2-3 days',
      highlights: ['Tiger sightings', 'Historic fort', 'Jungle safari'],
      coordinates: { lat: 26.0173, lng: 76.5026 }
    },
    // Backwaters & Lakes
    {
      id: 13,
      name: 'Kerala Backwaters',
      city: 'Alleppey',
      state: 'Kerala',
      country: 'India',
      category: 'backwaters',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop',
      description: 'Serene network of lagoons and lakes perfect for houseboat cruises',
      averageCost: { budget: 2000, midRange: 6000, luxury: 15000 },
      bestTimeToVisit: 'September to March',
      rating: 4.8,
      suggestedDuration: '2-3 days',
      highlights: ['Houseboat stay', 'Village life', 'Coconut groves'],
      coordinates: { lat: 9.4981, lng: 76.3388 }
    },
    {
      id: 14,
      name: 'Dal Lake',
      city: 'Srinagar',
      state: 'Jammu & Kashmir',
      country: 'India',
      category: 'lakes',
      image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop',
      description: 'Jewel of Kashmir with floating gardens and traditional houseboats',
      averageCost: { budget: 2500, midRange: 6000, luxury: 15000 },
      bestTimeToVisit: 'April to October',
      rating: 4.7,
      suggestedDuration: '3-4 days',
      highlights: ['Shikara rides', 'Floating markets', 'Mughal gardens'],
      coordinates: { lat: 34.1218, lng: 74.8092 }
    },
    // Waterfalls
    {
      id: 15,
      name: 'Niagara Falls',
      city: 'Niagara Falls',
      state: 'New York',
      country: 'United States',
      category: 'waterfalls',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
      description: 'World-famous waterfalls with thundering cascades and mist boat rides',
      averageCost: { budget: 5000, midRange: 12000, luxury: 25000 },
      bestTimeToVisit: 'June to August',
      rating: 4.8,
      suggestedDuration: '2-3 days',
      highlights: ['Maid of Mist', 'Cave of Winds', 'Rainbow views'],
      coordinates: { lat: 43.0962, lng: -79.0377 }
    },
    // International Destinations
    {
      id: 16,
      name: 'Eiffel Tower',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      category: 'monuments',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop',
      description: 'Iconic iron lattice tower and symbol of Paris with panoramic city views',
      averageCost: { budget: 8000, midRange: 20000, luxury: 50000 },
      bestTimeToVisit: 'April to June, September to November',
      rating: 4.9,
      suggestedDuration: '2-3 hours',
      highlights: ['City views', 'Light show', 'Seine River cruise'],
      coordinates: { lat: 48.8584, lng: 2.2945 }
    },
    {
      id: 17,
      name: 'Big Ben',
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      category: 'monuments',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
      description: 'Iconic clock tower and symbol of London with Gothic Revival architecture',
      averageCost: { budget: 10000, midRange: 25000, luxury: 60000 },
      bestTimeToVisit: 'May to September',
      rating: 4.7,
      suggestedDuration: '1-2 hours',
      highlights: ['Clock chimes', 'Houses of Parliament', 'Thames views'],
      coordinates: { lat: 51.4994, lng: -0.1245 }
    },
    {
      id: 18,
      name: 'Mount Fuji',
      city: 'Fujinomiya',
      state: 'Shizuoka',
      country: 'Japan',
      category: 'mountains',
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
      description: 'Sacred mountain and iconic symbol of Japan with perfect cone shape',
      averageCost: { budget: 15000, midRange: 35000, luxury: 80000 },
      bestTimeToVisit: 'July to September',
      rating: 4.9,
      suggestedDuration: '2-3 days',
      highlights: ['Climbing season', 'Five Lakes', 'Cherry blossoms'],
      coordinates: { lat: 35.3606, lng: 138.7274 }
    },
    // More Indian Destinations
    {
      id: 19,
      name: 'Mysore Palace',
      city: 'Mysore',
      state: 'Karnataka',
      country: 'India',
      category: 'palaces',
      image: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&h=600&fit=crop',
      description: 'Magnificent palace with Indo-Saracenic architecture and royal grandeur',
      averageCost: { budget: 1000, midRange: 3000, luxury: 8000 },
      bestTimeToVisit: 'October to March',
      rating: 4.6,
      suggestedDuration: '3-4 hours',
      highlights: ['Illumination', 'Royal artifacts', 'Durbar Hall'],
      coordinates: { lat: 12.3051, lng: 76.6558 }
    },
    {
      id: 20,
      name: 'Hampi',
      city: 'Hampi',
      state: 'Karnataka',
      country: 'India',
      category: 'historical',
      image: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800&h=600&fit=crop',
      description: 'UNESCO World Heritage Site with magnificent ruins of Vijayanagara Empire',
      averageCost: { budget: 1200, midRange: 3500, luxury: 8000 },
      bestTimeToVisit: 'October to February',
      rating: 4.7,
      suggestedDuration: '2-3 days',
      highlights: ['Virupaksha Temple', 'Stone chariot', 'Boulder landscapes'],
      coordinates: { lat: 15.3350, lng: 76.4600 }
    },
    {
      id: 21,
      name: 'Rishikesh',
      city: 'Rishikesh',
      state: 'Uttarakhand',
      country: 'India',
      category: 'adventure',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      description: 'Yoga capital of the world with river rafting and spiritual retreats',
      averageCost: { budget: 1000, midRange: 3000, luxury: 8000 },
      bestTimeToVisit: 'March to June, September to November',
      rating: 4.5,
      suggestedDuration: '3-4 days',
      highlights: ['River rafting', 'Yoga ashrams', 'Ganga Aarti'],
      coordinates: { lat: 30.0869, lng: 78.2676 }
    },
    {
      id: 22,
      name: 'Udaipur City Palace',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      category: 'palaces',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      description: 'Magnificent palace complex overlooking Lake Pichola with royal architecture',
      averageCost: { budget: 1500, midRange: 4000, luxury: 12000 },
      bestTimeToVisit: 'September to March',
      rating: 4.8,
      suggestedDuration: '2-3 days',
      highlights: ['Lake views', 'Boat rides', 'Royal courtyards'],
      coordinates: { lat: 24.5761, lng: 73.6833 }
    },
    {
      id: 23,
      name: 'Leh Ladakh',
      city: 'Leh',
      state: 'Jammu & Kashmir',
      country: 'India',
      category: 'mountains',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      description: 'High-altitude desert with stunning landscapes and Buddhist monasteries',
      averageCost: { budget: 4000, midRange: 10000, luxury: 25000 },
      bestTimeToVisit: 'June to September',
      rating: 4.9,
      suggestedDuration: '7-10 days',
      highlights: ['Pangong Lake', 'Monasteries', 'Mountain passes'],
      coordinates: { lat: 34.1526, lng: 77.5771 }
    },
    {
      id: 24,
      name: 'Ajanta & Ellora Caves',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      category: 'historical',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      description: 'Ancient rock-cut caves with exquisite Buddhist and Hindu sculptures',
      averageCost: { budget: 1200, midRange: 3500, luxury: 8000 },
      bestTimeToVisit: 'November to March',
      rating: 4.7,
      suggestedDuration: '2-3 days',
      highlights: ['Ancient art', 'Rock architecture', 'Buddhist heritage'],
      coordinates: { lat: 20.5520, lng: 75.7033 }
    },
    {
      id: 25,
      name: 'Coorg Hill Station',
      city: 'Madikeri',
      state: 'Karnataka',
      country: 'India',
      category: 'hill stations',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      description: 'Scotland of India with coffee plantations and misty hills',
      averageCost: { budget: 2000, midRange: 5000, luxury: 12000 },
      bestTimeToVisit: 'October to March',
      rating: 4.6,
      suggestedDuration: '3-4 days',
      highlights: ['Coffee estates', 'Abbey Falls', 'Spice plantations'],
      coordinates: { lat: 12.4244, lng: 75.7382 }
    },
    {
      id: 26,
      name: 'Darjeeling',
      city: 'Darjeeling',
      state: 'West Bengal',
      country: 'India',
      category: 'hill stations',
      image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop',
      description: 'Queen of the Hills famous for tea gardens and Himalayan views',
      averageCost: { budget: 1800, midRange: 4500, luxury: 10000 },
      bestTimeToVisit: 'March to May, October to December',
      rating: 4.5,
      suggestedDuration: '3-4 days',
      highlights: ['Tea gardens', 'Tiger Hill sunrise', 'Toy train'],
      coordinates: { lat: 27.0410, lng: 88.2663 }
    },
    {
      id: 27,
      name: 'Khajuraho Temples',
      city: 'Khajuraho',
      state: 'Madhya Pradesh',
      country: 'India',
      category: 'temples',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      description: 'UNESCO World Heritage Site famous for intricate temple sculptures',
      averageCost: { budget: 1000, midRange: 3000, luxury: 7000 },
      bestTimeToVisit: 'October to March',
      rating: 4.6,
      suggestedDuration: '2-3 days',
      highlights: ['Sculptural art', 'Temple architecture', 'Light & sound show'],
      coordinates: { lat: 24.8318, lng: 79.9199 }
    },
    {
      id: 28,
      name: 'Ooty Hill Station',
      city: 'Ooty',
      state: 'Tamil Nadu',
      country: 'India',
      category: 'hill stations',
      image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop',
      description: 'Queen of Hill Stations in Nilgiri Mountains with colonial charm',
      averageCost: { budget: 1500, midRange: 4000, luxury: 10000 },
      bestTimeToVisit: 'April to June, September to November',
      rating: 4.4,
      suggestedDuration: '3-4 days',
      highlights: ['Botanical gardens', 'Lake boating', 'Tea estates'],
      coordinates: { lat: 11.4102, lng: 76.6950 }
    },
    {
      id: 29,
      name: 'Munnar Tea Gardens',
      city: 'Munnar',
      state: 'Kerala',
      country: 'India',
      category: 'hill stations',
      image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop',
      description: 'Picturesque hills covered with emerald tea plantations and spice gardens',
      averageCost: { budget: 2000, midRange: 5000, luxury: 12000 },
      bestTimeToVisit: 'September to March',
      rating: 4.7,
      suggestedDuration: '3-4 days',
      highlights: ['Tea plantations', 'Eravikulam National Park', 'Spice gardens'],
      coordinates: { lat: 10.0889, lng: 77.0595 }
    },
    {
      id: 30,
      name: 'Konark Sun Temple',
      city: 'Konark',
      state: 'Odisha',
      country: 'India',
      category: 'temples',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      description: 'UNESCO World Heritage Site shaped like a colossal chariot dedicated to Sun God',
      averageCost: { budget: 800, midRange: 2500, luxury: 6000 },
      bestTimeToVisit: 'October to March',
      rating: 4.6,
      suggestedDuration: '1-2 days',
      highlights: ['Stone chariot', 'Intricate carvings', 'Annual dance festival'],
      coordinates: { lat: 19.8877, lng: 86.0945 }
    }
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setLoading(false);
    }

    // Set destinations
    setDestinations(destinationsData);
    setLoading(false);
  }, []);

  // Filter destinations based on search, category, and country
  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesCountry = selectedCountry === 'all' || dest.country === selectedCountry;
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const getTravelTimeEstimate = (distanceKm) => {
    const averageSpeedKmH = 50;
    const hours = distanceKm / averageSpeedKmH;
    
    if (hours < 1) {
      return `${Math.round(hours * 60)} mins`;
    } else if (hours < 24) {
      return `${Math.round(hours)} hours`;
    } else {
      return `${Math.round(hours / 24)} days`;
    }
  };

  const handleViewOnMap = (destCoords) => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destCoords.lat},${destCoords.lng}`,
        '_blank'
      );
    } else {
      alert('Please allow location access to get directions!');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'mountains':
      case 'hill stations':
        return <Mountain className="w-4 h-4" />;
      case 'beaches':
      case 'islands':
        return <Waves className="w-4 h-4" />;
      case 'wildlife':
      case 'national parks':
        return <TreePine className="w-4 h-4" />;
      case 'monuments':
      case 'historical':
      case 'temples':
      case 'palaces':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24">
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Destinations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore breathtaking places around the world with personalized recommendations and travel insights
          </p>
        </div>
      
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
          <div className="flex items-center bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
            <Search className="text-gray-400 mr-3" size={20} />
          <input
            type="text"
              placeholder="Search destinations, cities, or states..."
              className="w-full text-lg outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

          <div className="flex flex-wrap justify-center gap-4">
          <select
              className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white shadow-md focus:border-blue-500 outline-none"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map(country => (
              <option key={country} value={country}>
                {country === 'all' ? 'All Countries' : country}
              </option>
            ))}
          </select>

          <select
              className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white shadow-md focus:border-blue-500 outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

        {/* Results Counter */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Showing {filteredDestinations.length} amazing destinations
          </p>
        </div>

      {/* Destinations Grid */}
      {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading destinations...</p>
          </div>
      ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No destinations found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map(destination => {
            const distance = userLocation && destination.coordinates ? 
              calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                destination.coordinates.lat, 
                destination.coordinates.lng
              ).toFixed(1) : null;
            
            return (
                <div
                key={destination.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="absolute top-3 right-3 bg-yellow-400 px-2 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 text-yellow-700 mr-1" />
                      <span className="text-xs font-bold text-yellow-700">{destination.rating}</span>
                    </div>
                  </div>
                  
                <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{destination.name}</h2>
                    <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold rounded-full px-3 py-1 mt-1 mb-2">{destination.category}</span>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm truncate">{destination.city}, {destination.state}</span>
                  </div>
                  
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                      <span>{destination.suggestedDuration}</span>
                    </div>
                    {distance && (
                      <div className="flex items-center">
                          <Navigation className="w-3 h-3 mr-1" />
                          <span>{distance} km away</span>
                      </div>
                    )}
                  </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Best time to visit:</p>
                      <p className="text-sm font-medium text-blue-600">{destination.bestTimeToVisit}</p>
                  </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Highlights:</h4>
                      <div className="flex flex-wrap gap-1">
                        {destination.highlights.slice(0, 2).map((highlight, index) => (
                        <span
                          key={index}
                            className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                        {destination.highlights.length > 2 && (
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                            +{destination.highlights.length - 2} more
                          </span>
                        )}
                    </div>
                  </div>

                    <div className="flex gap-3 mt-2 mb-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${destination.coordinates ? `${destination.coordinates.lat},${destination.coordinates.lng}` : encodeURIComponent(`${destination.name}, ${destination.city}, ${destination.state}, ${destination.country}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        View on Google Maps
                      </a>
                      <a
                        href={`https://en.wikipedia.org/wiki/${destination.name.replace(/ /g, '_')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-200 text-gray-700 text-xs font-semibold rounded-full px-3 py-1"
                      >
                        View on Wikipedia
                      </a>
                </div>
                  </div>
                </div>
            );
          })}
        </div>
      )}

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-500">
            Discover more amazing destinations and plan your perfect trip with personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
};

export default Destinations;