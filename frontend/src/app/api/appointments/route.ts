import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get user authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      service,
      barber,
      date,
      time,
      duration,
      price,
      userEmail,
      userName,
    } = body;

    // Validate required fields
    if (!service || !barber || !date || !time || !price) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Create appointment data
    const appointmentData = {
      userId,
      service,
      barber,
      date,
      time,
      duration,
      price,
      userEmail,
      userName,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would:
    // 1. Save to your database via backend API
    // 2. Send confirmation email
    // 3. Create calendar event
    // 4. Notify the barber

    // For now, we'll simulate a successful booking
    // You can replace this with actual backend API calls
    console.log('Appointment booked:', appointmentData);

    // Simulate API call to backend
    // const backendResponse = await fetch('http://localhost:3001/api/bookings', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${backendToken}`,
    //   },
    //   body: JSON.stringify({
    //     barberId: 1, // You'd map barber name to ID
    //     customerName: userName,
    //     customerEmail: userEmail,
    //     customerPhone: '', // You'd collect this in the booking flow
    //     serviceName: service,
    //     totalPrice: parseFloat(price.replace('$', '')),
    //     durationMinutes: parseInt(duration.split(' ')[0]),
    //     appointmentDateTime: `${date}T${convertTo24Hour(time)}:00`,
    //     clerkUserId: userId,
    //   }),
    // })

    return NextResponse.json({
      success: true,
      appointment: appointmentData,
      message: 'Appointment confirmed successfully',
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// Helper function to convert 12-hour time to 24-hour format
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  let [hours] = time.split(':');
  const [, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
}
