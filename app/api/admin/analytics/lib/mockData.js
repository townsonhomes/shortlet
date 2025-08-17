// app/api/admin/analytics/lib/mockData.js
// Concrete mock data for analytics (bookings, users, shortlets, services)
// Use these arrays to validate calculations and charts.

export const shortlets = [
  {
    _id: "s1",
    title: "Oceanview Suite",
    pricePerDay: 25000,
    category: "premium",
  },
  { _id: "s2", title: "City Center Loft", pricePerDay: 18000, category: "mid" },
  {
    _id: "s3",
    title: "Cozy Garden Flat",
    pricePerDay: 12000,
    category: "budget",
  },
  { _id: "s4", title: "Riverside Studio", pricePerDay: 15000, category: "mid" },
  {
    _id: "s5",
    title: "Penthouse Deluxe",
    pricePerDay: 40000,
    category: "luxury",
  },
];

export const users = [
  {
    _id: "u1",
    name: "Alice Johnson",
    email: "alice@example.com",
    createdAt: "2025-01-05T10:00:00.000Z",
  },
  {
    _id: "u2",
    name: "Ben Okafor",
    email: "ben@example.com",
    createdAt: "2025-02-10T12:00:00.000Z",
  },
  {
    _id: "u3",
    name: "Chioma N",
    email: "chioma@example.com",
    createdAt: "2025-03-02T09:30:00.000Z",
  },
  {
    _id: "u4",
    name: "David Smith",
    email: "david@example.com",
    createdAt: "2025-04-15T08:00:00.000Z",
  },
  {
    _id: "u5",
    name: "Evelyn Park",
    email: "evelyn@example.com",
    createdAt: "2025-05-20T14:00:00.000Z",
  },
  {
    _id: "u6",
    name: "Frank Lee",
    email: "frank@example.com",
    createdAt: "2025-06-01T11:00:00.000Z",
  },
];

export const bookings = [
  // January
  {
    _id: "b1",
    shortlet: "s1",
    user: "u1",
    checkInDate: "2025-01-10T14:00:00.000Z",
    checkOutDate: "2025-01-13T10:00:00.000Z",
    totalAmount: 75000,
    status: "confirmed",
    paid: true,
    channel: "checkout",
    createdAt: "2025-01-05T11:00:00.000Z",
  },
  // February
  {
    _id: "b2",
    shortlet: "s2",
    user: "u2",
    checkInDate: "2025-02-14T14:00:00.000Z",
    checkOutDate: "2025-02-16T10:00:00.000Z",
    totalAmount: 36000,
    status: "cancelled",
    paid: true, // payment retained even though cancelled in your system
    channel: "webhook",
    createdAt: "2025-02-10T13:00:00.000Z",
  },
  {
    _id: "b3",
    shortlet: "s3",
    user: "u3",
    checkInDate: "2025-02-20T14:00:00.000Z",
    checkOutDate: "2025-02-22T10:00:00.000Z",
    totalAmount: 24000,
    status: "confirmed",
    paid: false,
    channel: "checkout",
    createdAt: "2025-02-18T09:00:00.000Z",
  },
  // March
  {
    _id: "b4",
    shortlet: "s4",
    user: "u4",
    checkInDate: "2025-03-03T14:00:00.000Z",
    checkOutDate: "2025-03-05T10:00:00.000Z",
    totalAmount: 30000,
    status: "confirmed",
    paid: true,
    channel: "manual",
    createdAt: "2025-03-01T08:00:00.000Z",
  },
  {
    _id: "b5",
    shortlet: "s1",
    user: "u2",
    checkInDate: "2025-03-15T14:00:00.000Z",
    checkOutDate: "2025-03-18T10:00:00.000Z",
    totalAmount: 75000,
    status: "confirmed",
    paid: true,
    channel: "checkout",
    createdAt: "2025-03-10T10:00:00.000Z",
  },
  // April
  {
    _id: "b6",
    shortlet: "s5",
    user: "u5",
    checkInDate: "2025-04-02T14:00:00.000Z",
    checkOutDate: "2025-04-05T10:00:00.000Z",
    totalAmount: 120000,
    status: "confirmed",
    paid: true,
    channel: "checkout",
    createdAt: "2025-04-01T09:00:00.000Z",
  },
  // May
  {
    _id: "b7",
    shortlet: "s2",
    user: "u6",
    checkInDate: "2025-05-10T14:00:00.000Z",
    checkOutDate: "2025-05-12T10:00:00.000Z",
    totalAmount: 36000,
    status: "confirmed",
    paid: true,
    channel: "webhook",
    createdAt: "2025-05-08T12:00:00.000Z",
  },
  {
    _id: "b8",
    shortlet: "s4",
    user: "u1",
    checkInDate: "2025-05-18T14:00:00.000Z",
    checkOutDate: "2025-05-19T10:00:00.000Z",
    totalAmount: 15000,
    status: "cancelled",
    paid: false,
    channel: "checkout",
    createdAt: "2025-05-16T15:00:00.000Z",
  },
  // June (today-ish)
  {
    _id: "b9",
    shortlet: "s3",
    user: "u4",
    checkInDate: "2025-06-02T14:00:00.000Z",
    checkOutDate: "2025-06-04T10:00:00.000Z",
    totalAmount: 24000,
    status: "confirmed",
    paid: true,
    channel: "checkout",
    createdAt: "2025-06-01T11:00:00.000Z",
  },
];

export const services = [
  {
    _id: "sv1",
    shortlet: "s1",
    user: "u1",
    requestedBy: "u1",
    description: "Breakfast service",
    booking: "b1",
    paymentStatus: "paid",
    price: 3000,
    paymentReference: "svc-001",
    createdAt: "2025-01-11T09:00:00.000Z",
  },
  {
    _id: "sv2",
    shortlet: "s5",
    user: "u5",
    requestedBy: "u5",
    description: "Airport pickup",
    booking: "b6",
    paymentStatus: "unpaid",
    price: 8000,
    paymentReference: null,
    createdAt: "2025-04-01T13:00:00.000Z",
  },
];

export default {
  shortlets,
  users,
  bookings,
  services,
};
