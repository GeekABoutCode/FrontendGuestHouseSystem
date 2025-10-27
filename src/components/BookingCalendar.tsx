import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBookedDatesForRoom, getBookedDatesForProperty } from '../lib/bookingUtils';
import { Booking } from '../types';

interface BookingCalendarProps {
  propertyId: string;
  roomId?: string; // If provided, shows bookings for specific room; otherwise shows all property bookings
  existingBookings: Booking[];
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  onDateSelect?: (date: string) => void;
  disabled?: boolean;
}

export default function BookingCalendar({
  propertyId,
  roomId,
  existingBookings,
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect,
  disabled = false
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  useEffect(() => {
    if (roomId) {
      setBookedDates(getBookedDatesForRoom(roomId, propertyId, existingBookings));
    } else {
      setBookedDates(getBookedDatesForProperty(propertyId, existingBookings));
    }
  }, [roomId, propertyId, existingBookings]);

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

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

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateBooked = (day: number) => {
    const dateString = getDateString(day);
    return bookedDates.includes(dateString);
  };

  const isDateSelected = (day: number) => {
    const dateString = getDateString(day);
    return dateString === selectedCheckIn || dateString === selectedCheckOut;
  };

  const isDateInRange = (day: number) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const dateString = getDateString(day);
    return dateString > selectedCheckIn && dateString < selectedCheckOut;
  };

  const isDatePast = (day: number) => {
    const dateString = getDateString(day);
    return new Date(dateString) < new Date(today.toISOString().split('T')[0]);
  };

  const handleDateClick = (day: number) => {
    if (disabled || isDatePast(day) || isDateBooked(day)) return;
    
    const dateString = getDateString(day);
    onDateSelect?.(dateString);
  };

  const getDayClassName = (day: number) => {
    const baseClasses = "w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors";
    
    if (isDatePast(day)) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`;
    }
    
    if (isDateBooked(day)) {
      return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed border border-red-200`;
    }
    
    if (isDateSelected(day)) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    
    if (isDateInRange(day)) {
      return `${baseClasses} bg-blue-100 text-blue-600`;
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-100`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={disabled}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={disabled}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div key={index}>
            {day ? (
              <button
                onClick={() => handleDateClick(day)}
                className={getDayClassName(day)}
                disabled={disabled || isDatePast(day) || isDateBooked(day)}
              >
                {day}
              </button>
            ) : (
              <div className="w-10 h-10" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span className="text-gray-600">In Range</span>
        </div>
      </div>
    </div>
  );
}
