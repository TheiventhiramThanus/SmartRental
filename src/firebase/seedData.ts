import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';

/**
 * Firebase Seed Data Script
 * Run seedAllData() to populate Firestore with comprehensive mock data
 * for all collections used in the SmartRental & Management system
 */

// ============================================================
// 1. USERS COLLECTION
// ============================================================
const usersData = [
    {
        id: 'USR-001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+94 77 123 4567',
        role: 'customer',
        status: 'Active',
        joinDate: '2024-12-01',
        address: '45 Galle Road, Colombo 03, Sri Lanka',
        nicNumber: '199012345678',
        profileImage: '',
        totalBookings: 5,
        totalSpent: 485000
    },
    {
        id: 'USR-002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+94 76 234 5678',
        role: 'customer',
        status: 'Active',
        joinDate: '2024-12-15',
        address: '12 Duplication Road, Colombo 04, Sri Lanka',
        nicNumber: '199523456789',
        profileImage: '',
        totalBookings: 3,
        totalSpent: 312000
    },
    {
        id: 'USR-003',
        name: 'Sarah Johnson',
        email: 'sarah@smartrental.com',
        phone: '+94 71 345 6789',
        role: 'staff',
        status: 'Active',
        joinDate: '2024-01-15',
        address: '78 Bauddhaloka Mawatha, Colombo 07',
        nicNumber: '199834567890',
        profileImage: '',
        department: 'Operations'
    },
    {
        id: 'USR-004',
        name: 'Michael Brown',
        email: 'michael@smartrental.com',
        phone: '+94 70 456 7890',
        role: 'admin',
        status: 'Active',
        joinDate: '2023-06-01',
        address: '23 Independence Avenue, Colombo 07',
        nicNumber: '198745678901',
        profileImage: '',
        department: 'Management'
    },
    {
        id: 'USR-005',
        name: 'Amal Perera',
        email: 'amal@example.com',
        phone: '+94 77 567 8901',
        role: 'customer',
        status: 'Active',
        joinDate: '2025-01-05',
        address: '56 Kandy Road, Peradeniya',
        nicNumber: '200056789012',
        profileImage: '',
        totalBookings: 2,
        totalSpent: 156000
    },
    {
        id: 'USR-006',
        name: 'Priya Fernando',
        email: 'priya@example.com',
        phone: '+94 75 678 9012',
        role: 'customer',
        status: 'Active',
        joinDate: '2025-01-10',
        address: '89 Marine Drive, Galle',
        nicNumber: '199767890123',
        profileImage: '',
        totalBookings: 1,
        totalSpent: 84000
    },
    {
        id: 'USR-007',
        name: 'Kasun Silva',
        email: 'kasun@smartrental.com',
        phone: '+94 72 789 0123',
        role: 'staff',
        status: 'Active',
        joinDate: '2024-03-20',
        address: '34 High Level Road, Nugegoda',
        nicNumber: '199678901234',
        profileImage: '',
        department: 'Maintenance'
    },
    {
        id: 'USR-008',
        name: 'Nimal Jayawardena',
        email: 'nimal@smartrental.com',
        phone: '+94 78 890 1234',
        role: 'staff',
        status: 'Active',
        joinDate: '2024-05-15',
        address: '67 Negombo Road, Wattala',
        nicNumber: '199489012345',
        profileImage: '',
        department: 'Delivery'
    },
    {
        id: 'USR-009',
        name: 'Dilshan Ratnayake',
        email: 'dilshan@example.com',
        phone: '+94 77 901 2345',
        role: 'customer',
        status: 'Inactive',
        joinDate: '2024-11-20',
        address: '12 Temple Road, Kandy',
        nicNumber: '199990123456',
        profileImage: '',
        totalBookings: 0,
        totalSpent: 0
    },
    {
        id: 'USR-010',
        name: 'Tharushi Bandara',
        email: 'tharushi@example.com',
        phone: '+94 76 012 3456',
        role: 'customer',
        status: 'Active',
        joinDate: '2025-02-01',
        address: '45 Lake Road, Kurunegala',
        nicNumber: '200101234567',
        profileImage: '',
        totalBookings: 4,
        totalSpent: 390000
    }
];

// ============================================================
// 2. VEHICLES COLLECTION
// ============================================================
const vehiclesData = [
    {
        id: 'VEH-001',
        name: 'Tesla Model 3',
        model: 'Model 3 Long Range',
        year: 2024,
        licensePlate: 'WP-CAR-1234',
        dailyRate: 36000,
        hourlyRate: 4500,
        pricePerKm: 150,
        type: 'Electric',
        fuelType: 'Electric',
        seats: 5,
        transmission: 'Automatic',
        status: 'Available',
        mileage: 5420,
        image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Premium electric sedan with autopilot features and long range battery',
        color: 'Pearl White',
        engineCapacity: 'N/A - Electric',
        insuranceExpiry: '2026-06-30',
        lastServiceDate: '2025-01-15'
    },
    {
        id: 'VEH-002',
        name: 'BMW 5 Series',
        model: '530i Luxury',
        year: 2023,
        licensePlate: 'WP-LUX-5678',
        dailyRate: 45000,
        hourlyRate: 6000,
        pricePerKm: 225,
        type: 'Luxury',
        fuelType: 'Petrol',
        seats: 5,
        transmission: 'Automatic',
        status: 'Rented',
        mileage: 12350,
        image: 'https://images.unsplash.com/photo-1687993320725-c4c2708ef074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Luxury sedan with premium features, leather interior and comfort package',
        color: 'Mineral White',
        engineCapacity: '2.0L Turbo',
        insuranceExpiry: '2026-08-15',
        lastServiceDate: '2025-01-10'
    },
    {
        id: 'VEH-003',
        name: 'Toyota RAV4',
        model: 'RAV4 Adventure',
        year: 2024,
        licensePlate: 'WP-SUV-9012',
        dailyRate: 19500,
        hourlyRate: 2500,
        pricePerKm: 120,
        type: 'SUV',
        fuelType: 'Diesel',
        seats: 7,
        transmission: 'Automatic',
        status: 'Available',
        mileage: 8900,
        image: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Versatile SUV perfect for family trips and off-road adventures',
        color: 'Midnight Black',
        engineCapacity: '2.5L Diesel',
        insuranceExpiry: '2026-05-20',
        lastServiceDate: '2025-01-08'
    },
    {
        id: 'VEH-004',
        name: 'Porsche 911',
        model: '911 Carrera S',
        year: 2024,
        licensePlate: 'WP-SPT-3456',
        dailyRate: 60000,
        hourlyRate: 8000,
        pricePerKm: 360,
        type: 'Sports',
        fuelType: 'Petrol',
        seats: 2,
        transmission: 'Automatic',
        status: 'Available',
        mileage: 3200,
        image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Iconic sports car with breathtaking performance and handling',
        color: 'Guards Red',
        engineCapacity: '3.0L Twin-Turbo',
        insuranceExpiry: '2026-09-10',
        lastServiceDate: '2025-01-20'
    },
    {
        id: 'VEH-005',
        name: 'Honda Accord',
        model: 'Accord EX-L',
        year: 2024,
        licensePlate: 'WP-SED-7890',
        dailyRate: 16500,
        hourlyRate: 2200,
        pricePerKm: 105,
        type: 'Sedan',
        fuelType: 'Petrol',
        seats: 5,
        transmission: 'Automatic',
        status: 'Available',
        mileage: 15600,
        image: 'https://images.unsplash.com/photo-1648178328042-b7c0f62e4181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Reliable and fuel-efficient sedan, perfect for daily commutes',
        color: 'Platinum White',
        engineCapacity: '1.5L Turbo',
        insuranceExpiry: '2026-04-25',
        lastServiceDate: '2025-01-05'
    },
    {
        id: 'VEH-006',
        name: 'Mercedes E-Class',
        model: 'E300 AMG Line',
        year: 2023,
        licensePlate: 'WP-MRZ-2345',
        dailyRate: 42000,
        hourlyRate: 5500,
        pricePerKm: 255,
        type: 'Luxury',
        fuelType: 'Diesel',
        seats: 5,
        transmission: 'Automatic',
        status: 'Maintenance',
        mileage: 22100,
        image: 'https://images.unsplash.com/photo-1687993320725-c4c2708ef074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Executive luxury sedan with AMG body kit and premium interior',
        color: 'Obsidian Black',
        engineCapacity: '2.0L Diesel',
        insuranceExpiry: '2026-07-18',
        lastServiceDate: '2025-02-01'
    },
    {
        id: 'VEH-007',
        name: 'Toyota Prius',
        model: 'Prius Prime',
        year: 2024,
        licensePlate: 'WP-HYB-6789',
        dailyRate: 14000,
        hourlyRate: 1800,
        pricePerKm: 85,
        type: 'Hybrid',
        fuelType: 'Hybrid',
        seats: 5,
        transmission: 'Automatic',
        status: 'Available',
        mileage: 7800,
        image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Eco-friendly hybrid with exceptional fuel economy',
        color: 'Sea Glass Pearl',
        engineCapacity: '1.8L Hybrid',
        insuranceExpiry: '2026-03-30',
        lastServiceDate: '2025-01-12'
    },
    {
        id: 'VEH-008',
        name: 'Nissan X-Trail',
        model: 'X-Trail Ti',
        year: 2023,
        licensePlate: 'WP-SUV-0123',
        dailyRate: 18000,
        hourlyRate: 2400,
        pricePerKm: 110,
        type: 'SUV',
        fuelType: 'Petrol',
        seats: 7,
        transmission: 'Automatic',
        status: 'Rented',
        mileage: 18500,
        image: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        description: 'Spacious family SUV with advanced safety features',
        color: 'Brilliant Silver',
        engineCapacity: '2.5L',
        insuranceExpiry: '2026-11-05',
        lastServiceDate: '2025-01-22'
    }
];

// ============================================================
// 3. BOOKINGS COLLECTION
// ============================================================
const bookingsData = [
    {
        id: 'BOOK-001',
        customerId: 'USR-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+94 77 123 4567',
        carId: 'VEH-001',
        carName: 'Tesla Model 3',
        carImage: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-02-15',
        pickupTime: '09:00 AM',
        returnDate: '2026-02-18',
        returnTime: '05:00 PM',
        pickupLocation: 'SmartRental HQ - Colombo 07',
        returnLocation: 'SmartRental HQ - Colombo 07',
        status: 'Approved',
        estimatedCost: 108000,
        totalDays: 3,
        pricePerDay: 36000,
        driverRequired: false,
        additionalNotes: 'Need car seat for child',
        createdAt: '2026-02-10T10:30:00Z'
    },
    {
        id: 'BOOK-002',
        customerId: 'USR-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+94 76 234 5678',
        carId: 'VEH-002',
        carName: 'BMW 5 Series',
        carImage: 'https://images.unsplash.com/photo-1687993320725-c4c2708ef074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-02-10',
        pickupTime: '08:00 AM',
        returnDate: '2026-02-14',
        returnTime: '06:00 PM',
        pickupLocation: 'SmartRental HQ - Colombo 07',
        returnLocation: 'Bandaranaike International Airport',
        status: 'Ongoing',
        estimatedCost: 180000,
        totalDays: 4,
        pricePerDay: 45000,
        driverRequired: true,
        driverName: 'Nimal Jayawardena',
        additionalNotes: 'Airport drop-off required',
        createdAt: '2026-02-05T14:20:00Z'
    },
    {
        id: 'BOOK-003',
        customerId: 'USR-005',
        customerName: 'Amal Perera',
        customerEmail: 'amal@example.com',
        customerPhone: '+94 77 567 8901',
        carId: 'VEH-003',
        carName: 'Toyota RAV4',
        carImage: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-02-20',
        pickupTime: '07:00 AM',
        returnDate: '2026-02-25',
        returnTime: '07:00 PM',
        pickupLocation: 'SmartRental Branch - Kandy',
        returnLocation: 'SmartRental Branch - Kandy',
        status: 'Pending',
        estimatedCost: 97500,
        totalDays: 5,
        pricePerDay: 19500,
        driverRequired: false,
        additionalNotes: 'Family trip to hill country',
        createdAt: '2026-02-11T09:15:00Z'
    },
    {
        id: 'BOOK-004',
        customerId: 'USR-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+94 77 123 4567',
        carId: 'VEH-004',
        carName: 'Porsche 911',
        carImage: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-01-20',
        pickupTime: '10:00 AM',
        returnDate: '2026-01-22',
        returnTime: '10:00 AM',
        pickupLocation: 'SmartRental HQ - Colombo 07',
        returnLocation: 'SmartRental HQ - Colombo 07',
        status: 'Completed',
        estimatedCost: 120000,
        actualCost: 132000,
        totalDays: 2,
        pricePerDay: 60000,
        driverRequired: false,
        additionalNotes: 'Weekend getaway',
        createdAt: '2026-01-15T16:00:00Z'
    },
    {
        id: 'BOOK-005',
        customerId: 'USR-010',
        customerName: 'Tharushi Bandara',
        customerEmail: 'tharushi@example.com',
        customerPhone: '+94 76 012 3456',
        carId: 'VEH-005',
        carName: 'Honda Accord',
        carImage: 'https://images.unsplash.com/photo-1648178328042-b7c0f62e4181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-02-12',
        pickupTime: '08:30 AM',
        returnDate: '2026-02-16',
        returnTime: '05:30 PM',
        pickupLocation: 'SmartRental Branch - Kurunegala',
        returnLocation: 'SmartRental HQ - Colombo 07',
        status: 'Ongoing',
        estimatedCost: 66000,
        totalDays: 4,
        pricePerDay: 16500,
        driverRequired: false,
        additionalNotes: '',
        createdAt: '2026-02-08T11:45:00Z'
    },
    {
        id: 'BOOK-006',
        customerId: 'USR-006',
        customerName: 'Priya Fernando',
        customerEmail: 'priya@example.com',
        customerPhone: '+94 75 678 9012',
        carId: 'VEH-007',
        carName: 'Toyota Prius',
        carImage: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-01-25',
        pickupTime: '09:00 AM',
        returnDate: '2026-01-31',
        returnTime: '06:00 PM',
        pickupLocation: 'SmartRental Branch - Galle',
        returnLocation: 'SmartRental Branch - Galle',
        status: 'Completed',
        estimatedCost: 84000,
        actualCost: 84000,
        totalDays: 6,
        pricePerDay: 14000,
        driverRequired: false,
        additionalNotes: 'Long term rental for work',
        createdAt: '2026-01-20T08:30:00Z'
    },
    {
        id: 'BOOK-007',
        customerId: 'USR-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+94 76 234 5678',
        carId: 'VEH-008',
        carName: 'Nissan X-Trail',
        carImage: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-02-08',
        pickupTime: '06:00 AM',
        returnDate: '2026-02-12',
        returnTime: '08:00 PM',
        pickupLocation: 'SmartRental HQ - Colombo 07',
        returnLocation: 'SmartRental HQ - Colombo 07',
        status: 'Ongoing',
        estimatedCost: 72000,
        totalDays: 4,
        pricePerDay: 18000,
        driverRequired: true,
        driverName: 'Kasun Silva',
        additionalNotes: 'Need GPS navigation',
        createdAt: '2026-02-03T13:00:00Z'
    },
    {
        id: 'BOOK-008',
        customerId: 'USR-009',
        customerName: 'Dilshan Ratnayake',
        customerEmail: 'dilshan@example.com',
        customerPhone: '+94 77 901 2345',
        carId: 'VEH-003',
        carName: 'Toyota RAV4',
        carImage: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        pickupDate: '2026-01-10',
        pickupTime: '10:00 AM',
        returnDate: '2026-01-12',
        returnTime: '10:00 AM',
        pickupLocation: 'SmartRental Branch - Kandy',
        returnLocation: 'SmartRental Branch - Kandy',
        status: 'Cancelled',
        estimatedCost: 39000,
        totalDays: 2,
        pricePerDay: 19500,
        driverRequired: false,
        additionalNotes: 'Cancelled due to change of plans',
        createdAt: '2026-01-05T17:30:00Z'
    }
];

// ============================================================
// 4. PAYMENTS COLLECTION
// ============================================================
const paymentsData = [
    {
        id: 'PAY-001',
        invoiceNumber: 'INV-2026-001',
        bookingId: 'BOOK-004',
        customerId: 'USR-001',
        customerName: 'John Doe',
        carName: 'Porsche 911',
        amount: 132000,
        status: 'Paid',
        method: 'Credit Card',
        cardLast4: '4532',
        date: '2026-01-22',
        breakdown: {
            baseFare: 120000,
            distanceKm: 45,
            distanceCost: 16200,
            durationDays: 2,
            durationCost: 0,
            extraFees: -4200,
            tax: 0,
            total: 132000
        }
    },
    {
        id: 'PAY-002',
        invoiceNumber: 'INV-2026-002',
        bookingId: 'BOOK-006',
        customerId: 'USR-006',
        customerName: 'Priya Fernando',
        carName: 'Toyota Prius',
        amount: 84000,
        status: 'Paid',
        method: 'Bank Transfer',
        date: '2026-01-31',
        breakdown: {
            baseFare: 84000,
            distanceKm: 120,
            distanceCost: 0,
            durationDays: 6,
            durationCost: 0,
            extraFees: 0,
            tax: 0,
            total: 84000
        }
    },
    {
        id: 'PAY-003',
        invoiceNumber: 'INV-2026-003',
        bookingId: 'BOOK-001',
        customerId: 'USR-001',
        customerName: 'John Doe',
        carName: 'Tesla Model 3',
        amount: 108000,
        status: 'Pending',
        method: 'Cash',
        date: '2026-02-15',
        breakdown: {
            baseFare: 108000,
            distanceKm: 0,
            distanceCost: 0,
            durationDays: 3,
            durationCost: 0,
            extraFees: 0,
            tax: 0,
            total: 108000
        }
    },
    {
        id: 'PAY-004',
        invoiceNumber: 'INV-2026-004',
        bookingId: 'BOOK-002',
        customerId: 'USR-002',
        customerName: 'Jane Smith',
        carName: 'BMW 5 Series',
        amount: 180000,
        status: 'Pending',
        method: 'Credit Card',
        cardLast4: '8876',
        date: '2026-02-14',
        breakdown: {
            baseFare: 180000,
            distanceKm: 0,
            distanceCost: 0,
            durationDays: 4,
            durationCost: 0,
            extraFees: 0,
            tax: 0,
            total: 180000
        }
    },
    {
        id: 'PAY-005',
        invoiceNumber: 'INV-2026-005',
        bookingId: 'BOOK-005',
        customerId: 'USR-010',
        customerName: 'Tharushi Bandara',
        carName: 'Honda Accord',
        amount: 66000,
        status: 'Pending',
        method: 'Debit Card',
        cardLast4: '3210',
        date: '2026-02-16',
        breakdown: {
            baseFare: 66000,
            distanceKm: 0,
            distanceCost: 0,
            durationDays: 4,
            durationCost: 0,
            extraFees: 0,
            tax: 0,
            total: 66000
        }
    }
];

// ============================================================
// 5. MAINTENANCE RECORDS COLLECTION
// ============================================================
const maintenanceData = [
    {
        id: 'MNT-001',
        vehicleId: 'VEH-001',
        vehicleName: 'Tesla Model 3',
        date: '2025-01-15',
        type: 'Service',
        description: 'Regular checkup, tire rotation, and brake pad inspection',
        cost: 45000,
        performedBy: 'Tesla Service Center - Colombo',
        status: 'Completed',
        nextServiceDate: '2025-07-15'
    },
    {
        id: 'MNT-002',
        vehicleId: 'VEH-001',
        vehicleName: 'Tesla Model 3',
        date: '2024-12-20',
        type: 'Battery',
        description: 'Battery health check and software update',
        cost: 0,
        performedBy: 'Tesla Service Center - Colombo',
        status: 'Completed',
        nextServiceDate: '2025-06-20'
    },
    {
        id: 'MNT-003',
        vehicleId: 'VEH-002',
        vehicleName: 'BMW 5 Series',
        date: '2025-01-10',
        type: 'Oil Change',
        description: 'Engine oil and oil filter replacement, air filter check',
        cost: 36000,
        performedBy: 'BMW Authorized Service - Colombo',
        status: 'Completed',
        nextServiceDate: '2025-04-10'
    },
    {
        id: 'MNT-004',
        vehicleId: 'VEH-003',
        vehicleName: 'Toyota RAV4',
        date: '2025-01-08',
        type: 'Full Service',
        description: 'Complete 10,000km service including oil, filters, brake check',
        cost: 28000,
        performedBy: 'Toyota Lanka - Colombo',
        status: 'Completed',
        nextServiceDate: '2025-07-08'
    },
    {
        id: 'MNT-005',
        vehicleId: 'VEH-006',
        vehicleName: 'Mercedes E-Class',
        date: '2025-02-01',
        type: 'Repair',
        description: 'Suspension repair and wheel alignment',
        cost: 85000,
        performedBy: 'DIMO - Mercedes Authorized Service',
        status: 'In Progress',
        nextServiceDate: '2025-08-01'
    },
    {
        id: 'MNT-006',
        vehicleId: 'VEH-005',
        vehicleName: 'Honda Accord',
        date: '2025-01-05',
        type: 'Tire Replacement',
        description: 'All 4 tires replaced with Michelin Primacy 4',
        cost: 120000,
        performedBy: 'AutoMirage Tyre Shop',
        status: 'Completed',
        nextServiceDate: '2026-01-05'
    },
    {
        id: 'MNT-007',
        vehicleId: 'VEH-004',
        vehicleName: 'Porsche 911',
        date: '2025-01-20',
        type: 'Service',
        description: 'Annual service, brake fluid replacement, engine diagnostics',
        cost: 95000,
        performedBy: 'Porsche Centre Colombo',
        status: 'Completed',
        nextServiceDate: '2026-01-20'
    }
];

// ============================================================
// 6. DRIVERS COLLECTION
// ============================================================
const driversData = [
    {
        id: 'DRV-001',
        name: 'Nimal Jayawardena',
        email: 'nimal@smartrental.com',
        phone: '+94 78 890 1234',
        licenseNumber: 'B-12345678',
        licenseExpiry: '2027-06-30',
        status: 'On Route',
        assignedVehicle: 'VAN-001',
        currentDeliveries: 4,
        totalDeliveries: 156,
        rating: 4.8,
        joinDate: '2024-05-15',
        center: 'Colombo',
        avatar: ''
    },
    {
        id: 'DRV-002',
        name: 'Sarah Perera',
        email: 'sarahp@smartrental.com',
        phone: '+94 71 901 2345',
        licenseNumber: 'B-23456789',
        licenseExpiry: '2028-03-15',
        status: 'On Route',
        assignedVehicle: 'VAN-002',
        currentDeliveries: 3,
        totalDeliveries: 122,
        rating: 4.9,
        joinDate: '2024-07-20',
        center: 'Colombo',
        avatar: ''
    },
    {
        id: 'DRV-003',
        name: 'Mike Fernando',
        email: 'mikef@smartrental.com',
        phone: '+94 72 012 3456',
        licenseNumber: 'B-34567890',
        licenseExpiry: '2027-09-20',
        status: 'Available',
        assignedVehicle: 'VAN-003',
        currentDeliveries: 0,
        totalDeliveries: 89,
        rating: 4.6,
        joinDate: '2024-09-10',
        center: 'Colombo',
        avatar: ''
    },
    {
        id: 'DRV-004',
        name: 'Emma Wickramasinghe',
        email: 'emmaw@smartrental.com',
        phone: '+94 77 123 4567',
        licenseNumber: 'B-45678901',
        licenseExpiry: '2027-12-01',
        status: 'On Route',
        assignedVehicle: 'VAN-004',
        currentDeliveries: 5,
        totalDeliveries: 201,
        rating: 4.7,
        joinDate: '2024-02-01',
        center: 'Kandy',
        avatar: ''
    },
    {
        id: 'DRV-005',
        name: 'Tom Rajapaksa',
        email: 'tomr@smartrental.com',
        phone: '+94 75 234 5678',
        licenseNumber: 'B-56789012',
        licenseExpiry: '2028-05-15',
        status: 'Available',
        assignedVehicle: 'VAN-005',
        currentDeliveries: 0,
        totalDeliveries: 67,
        rating: 4.5,
        joinDate: '2024-11-01',
        center: 'Galle',
        avatar: ''
    }
];

// ============================================================
// 7. ORDERS COLLECTION (Management System)
// ============================================================
const ordersData = [
    {
        id: 'ORD-2026-045',
        customer: 'Acme Corp',
        contactPerson: 'John Doe',
        salesRep: 'John Smith',
        date: '2026-02-11',
        deliveryAddress: '123 Main St, City Center, Colombo',
        items: [
            { product: 'ISDN Basic Line', sku: 'ISDN-BL-001', quantity: 10, unitPrice: 1200, total: 12000 },
            { product: 'ISDN Terminal Adapter', sku: 'ISDN-TA-003', quantity: 3, unitPrice: 150, total: 450 }
        ],
        totalAmount: 12450,
        status: 'Approved',
        priority: 'High',
        notes: 'Urgent delivery required'
    },
    {
        id: 'ORD-2026-044',
        customer: 'Tech Solutions',
        contactPerson: 'Jane Smith',
        salesRep: 'John Smith',
        date: '2026-02-11',
        deliveryAddress: '456 Tech Park, North District, Colombo',
        items: [
            { product: 'ISDN Primary Rate Interface', sku: 'ISDN-PRI-002', quantity: 5, unitPrice: 1600, total: 8000 },
            { product: 'ISDN NT1 Device', sku: 'ISDN-NT1-004', quantity: 2, unitPrice: 160, total: 320 }
        ],
        totalAmount: 8320,
        status: 'Pending',
        priority: 'Normal',
        notes: ''
    },
    {
        id: 'ORD-2026-043',
        customer: 'Global Traders',
        contactPerson: 'Mike Johnson',
        salesRep: 'John Smith',
        date: '2026-02-10',
        deliveryAddress: '789 Business Ave, South Zone, Colombo',
        items: [
            { product: 'ISDN Basic Line', sku: 'ISDN-BL-001', quantity: 12, unitPrice: 1200, total: 14400 },
            { product: 'ISDN Terminal Adapter', sku: 'ISDN-TA-003', quantity: 8, unitPrice: 150, total: 1200 }
        ],
        totalAmount: 15600,
        status: 'Approved',
        priority: 'High',
        notes: 'Bulk order - apply 5% discount'
    },
    {
        id: 'ORD-2026-042',
        customer: 'Metro Systems',
        contactPerson: 'Robert Lee',
        salesRep: 'John Smith',
        date: '2026-02-10',
        deliveryAddress: '321 Industrial Rd, East Side, Colombo',
        items: [
            { product: 'ISDN Primary Rate Interface', sku: 'ISDN-PRI-002', quantity: 6, unitPrice: 1600, total: 9600 },
            { product: 'ISDN NT1 Device', sku: 'ISDN-NT1-004', quantity: 2, unitPrice: 135, total: 270 }
        ],
        totalAmount: 9870,
        status: 'Delivered',
        priority: 'Normal',
        notes: ''
    },
    {
        id: 'ORD-2026-041',
        customer: 'Smart Tech',
        contactPerson: 'Amy Chen',
        salesRep: 'John Smith',
        date: '2026-02-09',
        deliveryAddress: '555 Innovation Hub, Colombo 10',
        items: [
            { product: 'ISDN Basic Line', sku: 'ISDN-BL-001', quantity: 8, unitPrice: 1200, total: 9600 },
            { product: 'ISDN Terminal Adapter', sku: 'ISDN-TA-003', quantity: 10, unitPrice: 160, total: 1600 }
        ],
        totalAmount: 11200,
        status: 'Approved',
        priority: 'Normal',
        notes: 'New customer - first order'
    }
];

// ============================================================
// 8. PRODUCTS/INVENTORY COLLECTION
// ============================================================
const productsData = [
    {
        id: 'PROD-001',
        name: 'ISDN Basic Line',
        sku: 'ISDN-BL-001',
        category: 'Connectivity',
        unitPrice: 1200,
        stock: 250,
        rdcLocation: 'RDC North - Colombo',
        status: 'In Stock',
        minStock: 50,
        maxStock: 500,
        supplier: 'TeleCom Supplies Ltd',
        lastRestocked: '2026-01-15',
        description: 'Standard ISDN Basic Rate line connection'
    },
    {
        id: 'PROD-002',
        name: 'ISDN Primary Rate Interface',
        sku: 'ISDN-PRI-002',
        category: 'Connectivity',
        unitPrice: 1600,
        stock: 45,
        rdcLocation: 'RDC North - Colombo',
        status: 'Low Stock',
        minStock: 50,
        maxStock: 200,
        supplier: 'Network Solutions Inc',
        lastRestocked: '2026-01-20',
        description: 'ISDN Primary Rate Interface for enterprise use'
    },
    {
        id: 'PROD-003',
        name: 'ISDN Terminal Adapter',
        sku: 'ISDN-TA-003',
        category: 'Hardware',
        unitPrice: 150,
        stock: 180,
        rdcLocation: 'RDC South - Galle',
        status: 'In Stock',
        minStock: 30,
        maxStock: 300,
        supplier: 'Digital Equipment Corp',
        lastRestocked: '2026-02-01',
        description: 'External ISDN Terminal Adapter for analog devices'
    },
    {
        id: 'PROD-004',
        name: 'ISDN NT1 Device',
        sku: 'ISDN-NT1-004',
        category: 'Hardware',
        unitPrice: 160,
        stock: 5,
        rdcLocation: 'RDC East - Kandy',
        status: 'Critical',
        minStock: 20,
        maxStock: 100,
        supplier: 'TeleCom Supplies Ltd',
        lastRestocked: '2025-12-10',
        description: 'Network Termination 1 device for ISDN U-interface'
    },
    {
        id: 'PROD-005',
        name: 'ISDN BRI Router',
        sku: 'ISDN-BR-005',
        category: 'Networking',
        unitPrice: 2500,
        stock: 120,
        rdcLocation: 'RDC North - Colombo',
        status: 'In Stock',
        minStock: 25,
        maxStock: 200,
        supplier: 'Network Solutions Inc',
        lastRestocked: '2026-01-28',
        description: 'ISDN BRI Router with integrated firewall'
    },
    {
        id: 'PROD-006',
        name: 'ISDN PBX System',
        sku: 'ISDN-PBX-006',
        category: 'Telephony',
        unitPrice: 8500,
        stock: 35,
        rdcLocation: 'RDC North - Colombo',
        status: 'In Stock',
        minStock: 10,
        maxStock: 50,
        supplier: 'Digital Equipment Corp',
        lastRestocked: '2026-02-05',
        description: 'Complete PBX system supporting up to 30 ISDN lines'
    }
];

// ============================================================
// 9. BUSINESS CUSTOMERS COLLECTION (Management)
// ============================================================
const businessCustomersData = [
    {
        id: 'BCUST-001',
        name: 'Acme Corp',
        contactPerson: 'John Doe',
        email: 'john@acmecorp.com',
        phone: '+94 11 234 5678',
        address: '123 Main St, City Center, Colombo',
        totalOrders: 24,
        totalValue: 125400,
        creditLimit: 200000,
        paymentTerms: 'Net 30',
        status: 'Active',
        joinDate: '2024-06-15'
    },
    {
        id: 'BCUST-002',
        name: 'Tech Solutions',
        contactPerson: 'Jane Smith',
        email: 'jane@techsolutions.lk',
        phone: '+94 11 345 6789',
        address: '456 Tech Park, North District, Colombo',
        totalOrders: 18,
        totalValue: 98320,
        creditLimit: 150000,
        paymentTerms: 'Net 15',
        status: 'Active',
        joinDate: '2024-08-20'
    },
    {
        id: 'BCUST-003',
        name: 'Global Traders',
        contactPerson: 'Mike Johnson',
        email: 'mike@globaltraders.com',
        phone: '+94 11 456 7890',
        address: '789 Business Ave, South Zone, Colombo',
        totalOrders: 32,
        totalValue: 215600,
        creditLimit: 300000,
        paymentTerms: 'Net 30',
        status: 'Active',
        joinDate: '2024-03-10'
    },
    {
        id: 'BCUST-004',
        name: 'Metro Systems',
        contactPerson: 'Robert Lee',
        email: 'robert@metrosys.lk',
        phone: '+94 11 567 8901',
        address: '321 Industrial Rd, East Side, Colombo',
        totalOrders: 15,
        totalValue: 78500,
        creditLimit: 120000,
        paymentTerms: 'Net 30',
        status: 'Active',
        joinDate: '2024-10-05'
    },
    {
        id: 'BCUST-005',
        name: 'Smart Tech',
        contactPerson: 'Amy Chen',
        email: 'amy@smarttech.lk',
        phone: '+94 11 678 9012',
        address: '555 Innovation Hub, Colombo 10',
        totalOrders: 1,
        totalValue: 11200,
        creditLimit: 50000,
        paymentTerms: 'Net 15',
        status: 'Active',
        joinDate: '2026-02-09'
    }
];

// ============================================================
// 10. DELIVERY ROUTES COLLECTION
// ============================================================
const routesData = [
    {
        id: 'ROUTE-A',
        name: 'Route A - City Center',
        stops: 8,
        distance: '42 km',
        estimatedTime: '2h 15m',
        efficiency: '95%',
        assignedDriver: 'DRV-001',
        assignedVehicle: 'VAN-001',
        status: 'In Progress'
    },
    {
        id: 'ROUTE-B',
        name: 'Route B - North District',
        stops: 6,
        distance: '35 km',
        estimatedTime: '1h 50m',
        efficiency: '92%',
        assignedDriver: 'DRV-002',
        assignedVehicle: 'VAN-002',
        status: 'In Progress'
    },
    {
        id: 'ROUTE-C',
        name: 'Route C - South Zone',
        stops: 5,
        distance: '28 km',
        estimatedTime: '1h 30m',
        efficiency: '97%',
        assignedDriver: 'DRV-004',
        assignedVehicle: 'VAN-004',
        status: 'In Progress'
    },
    {
        id: 'ROUTE-D',
        name: 'Route D - East Industrial',
        stops: 6,
        distance: '38 km',
        estimatedTime: '2h 00m',
        efficiency: '89%',
        assignedDriver: 'DRV-003',
        assignedVehicle: 'VAN-003',
        status: 'Scheduled'
    },
    {
        id: 'ROUTE-E',
        name: 'Route E - Suburbs',
        stops: 4,
        distance: '52 km',
        estimatedTime: '2h 30m',
        efficiency: '85%',
        assignedDriver: 'DRV-005',
        assignedVehicle: 'VAN-005',
        status: 'Scheduled'
    }
];

// ============================================================
// 11. DELIVERY ISSUES COLLECTION
// ============================================================
const issuesData = [
    {
        id: 'ISS-001',
        driverId: 'DRV-004',
        driverName: 'Emma Wickramasinghe',
        orderId: 'ORD-2026-048',
        issue: 'Traffic congestion on A1 highway',
        reportedAt: '2026-02-11T10:30:00Z',
        severity: 'Medium',
        status: 'Open',
        resolution: ''
    },
    {
        id: 'ISS-002',
        driverId: 'DRV-001',
        driverName: 'Nimal Jayawardena',
        orderId: 'ORD-2026-045',
        issue: 'Customer not available at delivery address',
        reportedAt: '2026-02-11T09:15:00Z',
        severity: 'High',
        status: 'In Progress',
        resolution: 'Rescheduling delivery for afternoon'
    },
    {
        id: 'ISS-003',
        driverId: 'DRV-002',
        driverName: 'Sarah Perera',
        orderId: 'ORD-2026-046',
        issue: 'Vehicle minor brake issue',
        reportedAt: '2026-02-11T08:45:00Z',
        severity: 'Low',
        status: 'Resolved',
        resolution: 'Issue resolved after quick inspection'
    }
];

// ============================================================
// 12. STAFF SALARY COLLECTION
// ============================================================
const staffSalaryData = [
    {
        id: 'SAL-001',
        staffId: 'USR-003',
        name: 'Sarah Johnson',
        role: 'Operations Staff',
        department: 'Operations',
        baseSalary: 85000,
        allowances: 15000,
        deductions: 12000,
        netSalary: 88000,
        month: 'January 2026',
        status: 'Paid',
        paidDate: '2026-01-31'
    },
    {
        id: 'SAL-002',
        staffId: 'USR-007',
        name: 'Kasun Silva',
        role: 'Maintenance Technician',
        department: 'Maintenance',
        baseSalary: 65000,
        allowances: 10000,
        deductions: 8000,
        netSalary: 67000,
        month: 'January 2026',
        status: 'Paid',
        paidDate: '2026-01-31'
    },
    {
        id: 'SAL-003',
        staffId: 'USR-008',
        name: 'Nimal Jayawardena',
        role: 'Delivery Driver',
        department: 'Delivery',
        baseSalary: 55000,
        allowances: 20000,
        deductions: 7500,
        netSalary: 67500,
        month: 'January 2026',
        status: 'Paid',
        paidDate: '2026-01-31'
    },
    {
        id: 'SAL-004',
        staffId: 'USR-004',
        name: 'Michael Brown',
        role: 'Admin Manager',
        department: 'Management',
        baseSalary: 150000,
        allowances: 25000,
        deductions: 22000,
        netSalary: 153000,
        month: 'January 2026',
        status: 'Paid',
        paidDate: '2026-01-31'
    }
];

// ============================================================
// 13. NOTIFICATIONS COLLECTION
// ============================================================
const notificationsData = [
    {
        id: 'NOTIF-001',
        userId: 'USR-001',
        title: 'Booking Approved',
        message: 'Your booking BOOK-001 for Tesla Model 3 has been approved.',
        type: 'booking',
        read: false,
        createdAt: '2026-02-11T10:35:00Z'
    },
    {
        id: 'NOTIF-002',
        userId: 'USR-002',
        title: 'Booking In Progress',
        message: 'Your BMW 5 Series rental has started. Drive safe!',
        type: 'booking',
        read: true,
        createdAt: '2026-02-10T08:05:00Z'
    },
    {
        id: 'NOTIF-003',
        userId: 'USR-001',
        title: 'Payment Received',
        message: 'Payment of LKR 132,000 for Porsche 911 rental received.',
        type: 'payment',
        read: true,
        createdAt: '2026-01-22T17:00:00Z'
    },
    {
        id: 'NOTIF-004',
        userId: 'USR-005',
        title: 'Booking Pending',
        message: 'Your booking BOOK-003 for Toyota RAV4 is pending approval.',
        type: 'booking',
        read: false,
        createdAt: '2026-02-11T09:20:00Z'
    },
    {
        id: 'NOTIF-005',
        userId: 'all',
        title: 'New Vehicle Added',
        message: 'Check out our brand new Toyota Prius - now available for rent!',
        type: 'announcement',
        read: false,
        createdAt: '2026-02-01T10:00:00Z'
    },
    {
        id: 'NOTIF-006',
        userId: 'USR-004',
        title: 'Maintenance Alert',
        message: 'Mercedes E-Class (VEH-006) suspension repair is in progress.',
        type: 'maintenance',
        read: false,
        createdAt: '2026-02-01T11:00:00Z'
    }
];

// ============================================================
// 14. SYSTEM SETTINGS / BRANCH LOCATIONS
// ============================================================
const branchesData = [
    {
        id: 'BRANCH-001',
        name: 'SmartRental HQ',
        address: 'No. 45, Independence Avenue, Colombo 07',
        city: 'Colombo',
        phone: '+94 11 234 5678',
        email: 'info@smartrental.lk',
        operatingHours: '6:00 AM - 10:00 PM',
        managerName: 'Michael Brown',
        totalVehicles: 5,
        status: 'Active'
    },
    {
        id: 'BRANCH-002',
        name: 'SmartRental - Kandy',
        address: 'No. 12, Peradeniya Road, Kandy',
        city: 'Kandy',
        phone: '+94 81 234 5678',
        email: 'kandy@smartrental.lk',
        operatingHours: '7:00 AM - 9:00 PM',
        managerName: 'Kasun Silva',
        totalVehicles: 2,
        status: 'Active'
    },
    {
        id: 'BRANCH-003',
        name: 'SmartRental - Galle',
        address: 'No. 89, Marine Drive, Galle',
        city: 'Galle',
        phone: '+94 91 234 5678',
        email: 'galle@smartrental.lk',
        operatingHours: '7:00 AM - 8:00 PM',
        managerName: 'Tom Rajapaksa',
        totalVehicles: 1,
        status: 'Active'
    }
];

// ============================================================
// SEED FUNCTION - Writes all data to Firestore
// ============================================================
async function seedCollection(collectionName: string, data: any[]) {
    console.log(`📝 Seeding ${collectionName}...`);
    for (const item of data) {
        const docRef = doc(db, collectionName, item.id);
        await setDoc(docRef, {
            ...item,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }
    console.log(`✅ ${collectionName}: ${data.length} documents added`);
}

export async function seedAllData() {
    console.log('🚀 Starting Firebase database seed...\n');

    try {
        await seedCollection('users', usersData);
        await seedCollection('vehicles', vehiclesData);
        await seedCollection('bookings', bookingsData);
        await seedCollection('payments', paymentsData);
        await seedCollection('maintenance', maintenanceData);
        await seedCollection('drivers', driversData);
        await seedCollection('orders', ordersData);
        await seedCollection('products', productsData);
        await seedCollection('businessCustomers', businessCustomersData);
        await seedCollection('routes', routesData);
        await seedCollection('issues', issuesData);
        await seedCollection('staffSalary', staffSalaryData);
        await seedCollection('notifications', notificationsData);
        await seedCollection('branches', branchesData);

        console.log('\n🎉 ALL DATA SEEDED SUCCESSFULLY!');
        console.log('================================================');
        console.log('Collections populated:');
        console.log(`  • users: ${usersData.length} documents`);
        console.log(`  • vehicles: ${vehiclesData.length} documents`);
        console.log(`  • bookings: ${bookingsData.length} documents`);
        console.log(`  • payments: ${paymentsData.length} documents`);
        console.log(`  • maintenance: ${maintenanceData.length} documents`);
        console.log(`  • drivers: ${driversData.length} documents`);
        console.log(`  • orders: ${ordersData.length} documents`);
        console.log(`  • products: ${productsData.length} documents`);
        console.log(`  • businessCustomers: ${businessCustomersData.length} documents`);
        console.log(`  • routes: ${routesData.length} documents`);
        console.log(`  • issues: ${issuesData.length} documents`);
        console.log(`  • staffSalary: ${staffSalaryData.length} documents`);
        console.log(`  • notifications: ${notificationsData.length} documents`);
        console.log(`  • branches: ${branchesData.length} documents`);
        console.log('================================================');

        return true;
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
}

// Export individual data for use in components
export {
    usersData,
    vehiclesData,
    bookingsData,
    paymentsData,
    maintenanceData,
    driversData,
    ordersData,
    productsData,
    businessCustomersData,
    routesData,
    issuesData,
    staffSalaryData,
    notificationsData,
    branchesData
};
