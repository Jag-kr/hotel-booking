const bcrypt = require('bcryptjs');
const { sequelize, User, Hotel, Room, Booking, Payment } = require('../models');

const roomImages = {
  standard: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  ],
  deluxe: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  ],
  suite: [
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
  ],
};

const hotelImages = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200',
];

async function seedDatabase() {
  try {
    console.log('🌱 Checking if database needs initial seeding...');
    const userCount = await User.count();
    if (userCount > 0 && process.env.FORCE_SEED !== 'true') {
      console.log('✅ Database already contains data. Skipping initial auto-seed.');
      return;
    }

    console.log('🌱 Starting automatic database seed...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables synced');

    // ─── Users ────────────────────────────────────────────────
    const adminPass = await bcrypt.hash('Admin@123', 12);
    const userPass = await bcrypt.hash('Guest@123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@hotelbooking.com',
      password: adminPass,
      phone: '+91-9876543210',
      location: 'Bangalore, India',
      role: 'admin',
    });

    const users = await User.bulkCreate([
      { name: 'Ravi Kumar', email: 'ravi@example.com', password: userPass, phone: '+91-9123456780', location: 'Chennai, India', role: 'user' },
      { name: 'Priya Sharma', email: 'priya@example.com', password: userPass, phone: '+91-9234567891', location: 'Mumbai, India', role: 'user' },
      { name: 'Arjun Nair', email: 'arjun@example.com', password: userPass, phone: '+91-9345678902', location: 'Hyderabad, India', role: 'user' },
      { name: 'Sneha Patel', email: 'sneha@example.com', password: userPass, phone: '+91-9456789013', location: 'Delhi, India', role: 'user' },
      { name: 'guest@example.com'.split('@')[0], email: 'guest@example.com', password: userPass, phone: '+91-9000000000', location: 'Bangalore, India', role: 'user' },
    ]);
    console.log('✅ Initial users created');

    // ─── Hotel ────────────────────────────────────────────────
    const hotel = await Hotel.create({
      name: 'Trinity Suites Bangalore',
      address: '1/3, Artillery Road, Cambridge Layout, Ulsoor, Bangalore, Karnataka 560008',
      city: 'Bangalore',
      description: `Trinity Suites Bangalore is a premium boutique serviced suite hotel nestled in the heart of Bangalore's Cambridge Layout. 
      Designed for the discerning modern traveller, our suites blend contemporary elegance with warm hospitality. 
      Enjoy spacious, thoughtfully appointed rooms with curated amenities, high-speed WiFi, and a personalized service experience. 
      Minutes from MG Road, UB City, and major IT corridors, Trinity Suites is the perfect base for business and leisure stays alike.`,
      amenities: [
        'Free WiFi', 'Air Conditioning', 'Swimming Pool', 'Fitness Center', 'Restaurant',
        '24/7 Room Service', 'Parking', 'Laundry Service', 'Concierge', 'Business Center',
        'Spa & Wellness', 'Airport Shuttle', 'Bar & Lounge', 'CCTV Security', 'Power Backup',
      ],
      images: hotelImages,
      rating: 4.5,
      phone: '+91-80-4567-8900',
      email: 'reservations@trinitysuites.in',
    });
    console.log('✅ Hotel created');

    // ─── Rooms ────────────────────────────────────────────────
    const roomData = [
      { roomNumber: '101', roomType: 'Standard', price: 3500, capacity: 2, discountPercent: 0, amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'En-suite Bathroom'], images: roomImages.standard, description: 'A cozy and comfortable standard room featuring modern furnishings, a plush queen-size bed, and all essential amenities for a relaxing stay.' },
      { roomNumber: '102', roomType: 'Standard', price: 3500, capacity: 2, discountPercent: 10, amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'En-suite Bathroom'], images: roomImages.standard, description: 'A cozy and comfortable standard room featuring modern furnishings, a plush queen-size bed, and all essential amenities for a relaxing stay.' },
      { roomNumber: '103', roomType: 'Standard', price: 3500, capacity: 2, discountPercent: 0, amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'En-suite Bathroom'], images: roomImages.standard, description: 'A cozy and comfortable standard room featuring modern furnishings, a plush queen-size bed, and all essential amenities for a relaxing stay.' },
      { roomNumber: '201', roomType: 'Deluxe', price: 5500, capacity: 3, discountPercent: 0, amenities: ['WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Bathtub', 'Work Desk', 'Room Service'], images: roomImages.deluxe, description: 'Step into refined comfort with our Deluxe rooms. Featuring elegant decor, a king-size bed, premium toiletries, and a dedicated work desk.' },
      { roomNumber: '202', roomType: 'Deluxe', price: 5500, capacity: 3, discountPercent: 15, amenities: ['WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Bathtub', 'Work Desk', 'Room Service'], images: roomImages.deluxe, description: 'Step into refined comfort with our Deluxe rooms. Featuring elegant decor, a king-size bed, premium toiletries, and a dedicated work desk.' },
      { roomNumber: '203', roomType: 'Deluxe', price: 5500, capacity: 3, discountPercent: 0, amenities: ['WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Bathtub', 'Work Desk', 'Room Service'], images: roomImages.deluxe, description: 'Step into refined comfort with our Deluxe rooms.' },
      { roomNumber: '301', roomType: 'Executive Suite', price: 8500, capacity: 4, discountPercent: 0, amenities: ['WiFi', 'AC', 'Smart TV', 'Full Bar', 'Jacuzzi', 'Living Room', 'Kitchenette', 'Butler Service', 'Balcony'], images: roomImages.suite, description: 'Experience unmatched luxury in our Executive Suites. A sprawling living area, separate bedroom, jacuzzi, and personalised butler service make this the ultimate indulgence.' },
      { roomNumber: '302', roomType: 'Executive Suite', price: 8500, capacity: 4, discountPercent: 20, amenities: ['WiFi', 'AC', 'Smart TV', 'Full Bar', 'Jacuzzi', 'Living Room', 'Kitchenette', 'Butler Service', 'Balcony'], images: roomImages.suite, description: 'Experience unmatched luxury in our Executive Suites.' },
      { roomNumber: '303', roomType: 'Executive Suite', price: 8500, capacity: 4, discountPercent: 0, amenities: ['WiFi', 'AC', 'Smart TV', 'Full Bar', 'Jacuzzi', 'Living Room', 'Kitchenette', 'Butler Service', 'Balcony'], images: roomImages.suite, description: 'Experience unmatched luxury in our Executive Suites.' },
    ];

    const rooms = await Room.bulkCreate(
      roomData.map(r => ({ ...r, hotelId: hotel.id }))
    );
    console.log('✅ Rooms created');

    // ─── Bookings ─────────────────────────────────────────────
    const today = new Date();
    const d = (offset) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().split('T')[0];
    };

    const bookingData = [
      { userId: users[0].id, roomId: rooms[0].id, checkIn: d(-10), checkOut: d(-8), guests: 2, totalAmount: 7000, bookingStatus: 'Confirmed', paymentStatus: 'Paid', guestName: users[0].name, guestEmail: users[0].email, guestPhone: users[0].phone },
      { userId: users[1].id, roomId: rooms[3].id, checkIn: d(-7), checkOut: d(-5), guests: 2, totalAmount: 11000, bookingStatus: 'Confirmed', paymentStatus: 'Paid', guestName: users[1].name, guestEmail: users[1].email, guestPhone: users[1].phone },
      { userId: users[2].id, roomId: rooms[6].id, checkIn: d(-5), checkOut: d(-3), guests: 3, totalAmount: 17000, bookingStatus: 'Confirmed', paymentStatus: 'Paid', guestName: users[2].name, guestEmail: users[2].email, guestPhone: users[2].phone },
      { userId: users[3].id, roomId: rooms[1].id, checkIn: d(-3), checkOut: d(-1), guests: 1, totalAmount: 3150, bookingStatus: 'Cancelled', paymentStatus: 'Pending', guestName: users[3].name, guestEmail: users[3].email, guestPhone: users[3].phone },
      { userId: users[0].id, roomId: rooms[4].id, checkIn: d(1), checkOut: d(3), guests: 2, totalAmount: 9350, bookingStatus: 'Confirmed', paymentStatus: 'Paid', guestName: users[0].name, guestEmail: users[0].email, guestPhone: users[0].phone },
      { userId: users[1].id, roomId: rooms[7].id, checkIn: d(2), checkOut: d(5), guests: 4, totalAmount: 20400, bookingStatus: 'Confirmed', paymentStatus: 'Paid', guestName: users[1].name, guestEmail: users[1].email, guestPhone: users[1].phone },
      { userId: users[4].id, roomId: rooms[2].id, checkIn: d(5), checkOut: d(7), guests: 2, totalAmount: 7000, bookingStatus: 'Pending', paymentStatus: 'Pending', guestName: 'Guest User', guestEmail: 'guest@example.com', guestPhone: '+91-9000000000' },
    ];

    const bookings = await Booking.bulkCreate(bookingData);
    console.log('✅ Bookings created');

    // ─── Payments ─────────────────────────────────────────────
    const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid');
    const paymentData = paidBookings.map((b, i) => ({
      bookingId: b.id,
      amount: b.totalAmount,
      paymentMethod: i % 2 === 0 ? 'card' : 'upi',
      transactionId: `TXN${Date.now()}${i}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'Success',
      cardLast4: `${4000 + i * 111}`.slice(-4),
    }));

    await Payment.bulkCreate(paymentData);
    console.log('✅ Payments created');
    console.log('🎉 Initial database auto-seed complete!');
  } catch (err) {
    console.error('❌ Auto-seed failed:', err.message);
  }
}

module.exports = seedDatabase;
