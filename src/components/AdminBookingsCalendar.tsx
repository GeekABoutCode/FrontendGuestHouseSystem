import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Property, Booking } from '../types';
import { getBookedDatesForRoom } from '../lib/bookingUtils';

interface AdminBookingsCalendarProps {
  properties: Property[];
  bookings: Booking[];
}

export default function AdminBookingsCalendar({ properties, bookings }: AdminBookingsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const filteredProperties = useMemo(() => {
    if (selectedProperty) {
      return properties.filter(p => p.id === selectedProperty);
    }
    return properties;
  }, [properties, selectedProperty]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Bookings Calendar</h3>
          <button
            onClick={() => setSelectedProperty(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedProperty
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Properties
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {properties.map(property => (
            <button
              key={property.id}
              onClick={() => setSelectedProperty(property.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedProperty === property.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {property.name}
            </button>
          ))}
        </div>
      </div>

      {filteredProperties.map(property => (
        <div key={property.id} className="mb-8 last:mb-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">{property.name}</h4>
          
          {/* Display calendar for each room in this property */}
          {property.rooms && property.rooms.length > 0 ? (
            property.rooms.map(room => {
              const bookedDates = getBookedDatesForRoom(room.id, property.id, bookings);

              return (
                <div key={room.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      {room.name || room.roomNumber || `Room ${room.id.substring(0, 8)}`}
                    </span>
                    <span className="text-xs text-gray-500">({room.type})</span>
                  </div>
                  
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h5 className="text-sm font-semibold text-gray-900">
                      {monthNames[month]} {year}
                    </h5>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border border-gray-200 rounded overflow-hidden max-w-2xl">
                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 bg-gray-100">
                      {dayNames.map(day => (
                        <div
                          key={day}
                          className="p-1 text-center text-xs font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="h-8 border-r border-b border-gray-200 bg-gray-50"
                        />
                      ))}

                      {/* Days of the month */}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dateString = getDateString(day);
                        const isBooked = bookedDates.includes(dateString);
                        const isToday = dateString === new Date().toISOString().split('T')[0];

                        return (
                          <div
                            key={day}
                            className={`h-8 border-r border-b border-gray-200 flex flex-col items-center justify-center ${
                              isToday ? 'bg-blue-50' : ''
                            }`}
                          >
                            <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                              {day}
                            </span>
                            {isBooked && (
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Booked" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-200 rounded-full" />
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 mb-4">No rooms available</p>
          )}
        </div>
      ))}
    </div>
  );
}

