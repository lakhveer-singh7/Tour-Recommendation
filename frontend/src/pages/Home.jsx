import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold text-indigo-800 mb-6">
          Smart Tour Planner
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          {user 
            ? `Welcome back, ${user.name}! Ready to plan your next adventure?`
            : 'Plan your perfect trip with AI-powered recommendations'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/preference" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            Start Planning
          </Link>
          {!user && (
            <Link 
              to="/register" 
              className="bg-white hover:bg-gray-100 text-indigo-600 font-medium py-3 px-6 rounded-lg shadow-md transition duration-300"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}