export const seedUsers = [
  {
    id: "user-admin-1",
    name: "Cecilia Alexandra Bennett",
    email: "admin@storegrid.com",
    address: "12 Market Street, New Delhi",
    password: "Admin@1234",
    role: "admin",
  },
  {
    id: "user-owner-1",
    name: "Jonathan Miles Fernandez",
    email: "owner@storegrid.com",
    address: "48 Riverfront Avenue, Bengaluru",
    password: "Owner@1234",
    role: "store_owner",
    storeId: "store-1",
  },
  {
    id: "user-normal-1",
    name: "Aarav Prakash Menon",
    email: "user@storegrid.com",
    address: "90 Lake View Road, Pune",
    password: "User@1234",
    role: "normal_user",
  },
  {
    id: "user-normal-2",
    name: "Saanvi Radhika Iyer",
    email: "saanvi@storegrid.com",
    address: "35 Orchid Residency, Hyderabad",
    password: "User@1234",
    role: "normal_user",
  },
];

export const seedStores = [
  {
    id: "store-1",
    name: "Urban Tonic Cafe",
    email: "hello@urbantonic.com",
    address: "118 MG Road, Bengaluru",
    ownerId: "user-owner-1",
  },
  {
    id: "store-2",
    name: "Northwind Groceries",
    email: "care@northwindgrocers.com",
    address: "22 Park Lane, Mumbai",
    ownerId: "",
  },
  {
    id: "store-3",
    name: "Metro Books and More",
    email: "support@metrobooks.com",
    address: "77 Connaught Place, Delhi",
    ownerId: "",
  },
];

export const seedRatings = [
  {
    id: "rating-1",
    userId: "user-normal-1",
    storeId: "store-1",
    rating: 5,
    feedback: "Clean service, quick checkout, and helpful staff.",
    updatedAt: "2026-06-24T10:20:00.000Z",
  },
  {
    id: "rating-2",
    userId: "user-normal-2",
    storeId: "store-1",
    rating: 4,
    feedback: "Good experience overall, but the evening queue can be long.",
    updatedAt: "2026-06-25T08:15:00.000Z",
  },
  {
    id: "rating-3",
    userId: "user-normal-1",
    storeId: "store-2",
    rating: 3,
    feedback: "Average selection, but the store is well maintained.",
    updatedAt: "2026-06-23T14:40:00.000Z",
  },
];
