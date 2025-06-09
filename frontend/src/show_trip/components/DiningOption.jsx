import React from 'react';
import { FaUtensils, FaClock } from 'react-icons/fa';
import { BiDollar } from 'react-icons/bi';
import { Link } from 'react-router-dom';

function DiningOptions({ restaurants }) {
  const getRestaurantImage = (restaurant) => {
    const cuisine = restaurant.cuisine.toLowerCase();
    if (cuisine.includes('indian')) {
      return "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=500&q=60";
    } else if (cuisine.includes('chinese')) {
      return "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=500&q=60";
    } else if (cuisine.includes('italian')) {
      return "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=500&q=60";
    } else if (cuisine.includes('mexican')) {
      return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=60";
    }
    return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=60";
  };

  const renderPriceRange = (priceRange) => {
    const count = priceRange.length;
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(4)].map((_, i) => (
          <BiDollar
            key={i}
            className={i < count ? 'text-green-600' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 md:px-8 py-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <FaUtensils className="text-emerald-600" />
        Dining Recommendations
      </h2>

          {(restaurants && restaurants.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="md:flex">
                <Link
                  to={`https://www.google.com/maps/search/?api=1&query=${restaurant.restaurantAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block md:w-1/3 h-48 md:h-auto overflow-hidden"
                >
                  <img
                    src={getRestaurantImage(restaurant)}
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-4 md:w-2/3 space-y-2">
                  <div className="flex justify-between items-start flex-wrap">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{restaurant.restaurantName}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
                          {restaurant.cuisine}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                          {restaurant.type}
                        </span>
                      </div>
                    </div>
                    <div>{renderPriceRange(restaurant.priceRange)}</div>
                  </div>

                  <p className="text-gray-600 text-sm">{restaurant.review}</p>

                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <FaClock className="mr-1" /> {restaurant.openingHours}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">No dining recommendations available.</p>
      )}
    </div>
  );
}

export default DiningOptions;
