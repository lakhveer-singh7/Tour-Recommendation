import React from 'react';
import { FaPlaceOfWorship, FaUtensils, FaShoppingBag, FaTree, FaLandmark } from 'react-icons/fa';
import { MdMuseum } from 'react-icons/md';

const PREFERENCE_CATEGORIES = [
  {
    category: 'Cultural & Historical',
    types: [
      { key: 'museum', label: 'Museum', icon: '🏛️' },
      { key: 'monument', label: 'Monument', icon: '🏯' },
      { key: 'temple', label: 'Temple', icon: '🕌' },
      { key: 'fort', label: 'Fort', icon: '🏰' },
      { key: 'heritage_site', label: 'Heritage Site', icon: '🏟️' },
      { key: 'archaeological_site', label: 'Archaeological Site', icon: '🗿' },
    ],
  },
  {
    category: 'Nature & Outdoors',
    types: [
      { key: 'park', label: 'Park', icon: '🌲' },
      { key: 'hill_station', label: 'Hill Station', icon: '⛰️' },
      { key: 'beach', label: 'Beach', icon: '🌅' },
      { key: 'botanical_garden', label: 'Botanical Garden', icon: '🌳' },
      { key: 'lake', label: 'Lake', icon: '🌄' },
      { key: 'nature_reserve', label: 'Nature Reserve', icon: '🏞️' },
      { key: 'waterfall', label: 'Waterfall', icon: '🌋' },
    ],
  },
  {
    category: 'Religious & Spiritual',
    types: [
      { key: 'temple', label: 'Temple', icon: '🛕' },
      { key: 'church', label: 'Church', icon: '⛪' },
      { key: 'synagogue', label: 'Synagogue', icon: '🕍' },
      { key: 'mosque', label: 'Mosque', icon: '🕋' },
      { key: 'meditation_center', label: 'Meditation Center', icon: '🧘' },
      { key: 'spiritual_retreat', label: 'Spiritual Retreat', icon: '⛩️' },
    ],
  },
  {
    category: 'Leisure & Entertainment',
    types: [
      { key: 'shopping', label: 'Shopping', icon: '🛍️' },
      { key: 'food', label: 'Food', icon: '🍽️' },
      { key: 'amusement_park', label: 'Amusement Park', icon: '🎢' },
      { key: 'cinema', label: 'Cinema', icon: '🎥' },
      { key: 'cultural_show', label: 'Cultural Show', icon: '🎭' },
      { key: 'fairground', label: 'Fairground', icon: '🎡' },
    ],
  },
  {
    category: 'Adventure & Activities',
    types: [
      { key: 'adventure_park', label: 'Adventure Park', icon: '🚴' },
      { key: 'trekking_trail', label: 'Trekking Trail', icon: '🧗' },
      { key: 'boating', label: 'Boating', icon: '🛶' },
      { key: 'water_sports', label: 'Water Sports', icon: '🏄' },
      { key: 'paragliding', label: 'Paragliding', icon: '🪂' },
      { key: 'gaming_zones', label: 'Gaming Zones', icon: '🎯' },
    ],
  },
  {
    category: 'Modern Attractions',
    types: [
      { key: 'city_center', label: 'City Center', icon: '🏙️' },
      { key: 'art_gallery', label: 'Art Gallery', icon: '🎨' },
      { key: 'science_center', label: 'Science Center', icon: '🧪' },
      { key: 'stadium', label: 'Stadium', icon: '🏟️' },
      { key: 'music_festival_venue', label: 'Music Festival Venue', icon: '🎼' },
    ],
  },
];

const PreferenceForm = ({ preferences, onInterestToggle, onSubmit, onReset, disabled, fullWidth }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 ${fullWidth ? 'w-full' : 'max-w-xl mx-auto'} mt-8 border border-gray-200`}>
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl p-6 mb-8 shadow-lg text-white text-center">
        <h2 className="text-3xl font-extrabold mb-2 drop-shadow">What are you interested in?</h2>
        <p className="text-lg font-medium">Select your travel preferences</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
        <div className="space-y-12">
          {PREFERENCE_CATEGORIES.map((cat) => (
            <div key={cat.category} className="mb-2">
              <h3 className="text-lg font-bold mb-4 text-blue-700 border-b border-blue-100 pb-1 pl-1">{cat.category}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {cat.types.map(pref => (
            <button
              type="button"
              key={pref.key}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-md transition-all border-2 focus:outline-none font-medium text-base
                ${preferences.interests.includes(pref.key)
                        ? 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border-blue-600 text-blue-700 scale-105 shadow-lg'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:scale-105'}`}
              onClick={() => onInterestToggle(pref.key)}
              disabled={disabled}
                    style={{ minWidth: 120 }}
            >
                    <span className="text-2xl mb-1">{pref.icon}</span>
                    <span className="mt-1 font-semibold">{pref.label}</span>
            </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <button
          type="submit"
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg transition-colors disabled:opacity-50"
          disabled={disabled}
        >
          Save Preferences
        </button>
          <button
            type="button"
            className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg shadow-lg transition-colors border border-gray-300"
            onClick={onReset}
            disabled={disabled}
          >
            Reset Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferenceForm;