import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PLACE_TYPES = ["museum", "park", "temple", "monument", "shopping", "food"];

export default function CompleteProfile() {
    const [preferences, setPreferences] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData;

    if (!userData) {
        navigate('/register');
        return null;
    }

    const handlePreferenceChange = (type) => {
        setPreferences((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/complete-google-profile', {
                ...userData,
                preferences
            });

            const { user, token } = response.data;
            login(user, token, true);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Complete Your Profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please select your preferences to help us personalize your experience
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                value={userData.name}
                                disabled
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={userData.email}
                                disabled
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Your Preferences
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PLACE_TYPES.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            value={type}
                                            checked={preferences.includes(type)}
                                            onChange={() => handlePreferenceChange(type)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? 'Completing Profile...' : 'Complete Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 