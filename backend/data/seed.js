// Starting data, with the same tables and columns as dbms/03_schema.sql.
// It's the same sample data the frontend uses, so both show the same things.
//
// Differences from the real database (until phase 5):
// - readable ids like 'user-aarav' instead of UUIDs (new rows do get UUIDs)
// - lives in memory, so it resets when the server restarts

// bcrypt hash of 'findr123', the password of every demo account
const demoPasswordHash = '$2b$10$Kc8fASMjp791ZNfuy387kOQ.z.PxDocH9Dr/0aVMbcDaTncPawozu'

export const users = [
  { user_id: 'user-aarav', full_name: 'Aarav Kapoor', email: 'aarav@northfield.edu', password_hash: demoPasswordHash, phone: '+91 98100 11111', profile_image_url: null, created_at: '2026-08-01T09:00:00+05:30' },
  { user_id: 'user-ananya', full_name: 'Ananya Sharma', email: 'ananya@northfield.edu', password_hash: demoPasswordHash, phone: '+91 98100 22222', profile_image_url: null, created_at: '2026-08-02T10:00:00+05:30' },
  { user_id: 'user-rohan', full_name: 'Rohan Verma', email: 'rohan@northfield.edu', password_hash: demoPasswordHash, phone: null, profile_image_url: null, created_at: '2026-08-02T11:30:00+05:30' },
  { user_id: 'user-kabir', full_name: 'Kabir Singh', email: 'kabir@northfield.edu', password_hash: demoPasswordHash, phone: '+91 98100 33333', profile_image_url: null, created_at: '2026-08-04T15:00:00+05:30' },
  { user_id: 'user-meera', full_name: 'Meera Iyer', email: 'meera@greenview.in', password_hash: demoPasswordHash, phone: null, profile_image_url: null, created_at: '2026-08-05T18:20:00+05:30' },
  { user_id: 'user-priya', full_name: 'Priya Nair', email: 'priya@lakesideresidency.in', password_hash: demoPasswordHash, phone: '+91 98100 44444', profile_image_url: null, created_at: '2026-08-10T08:45:00+05:30' },
  { user_id: 'user-arjun', full_name: 'Arjun Mehta', email: 'arjun@lakesideresidency.in', password_hash: demoPasswordHash, phone: null, profile_image_url: null, created_at: '2026-08-11T12:10:00+05:30' },
]

export const communities = [
  {
    community_id: 'northfield-college',
    name: 'Northfield Institute of Technology',
    community_type: 'COLLEGE',
    description: 'Library, lecture halls, cafeteria and sports complex.',
    address: 'Northfield Campus, Sonipat, Haryana',
    created_at: '2026-07-20T09:00:00+05:30',
  },
  {
    community_id: 'greenview-hostel',
    name: 'Greenview Hostel',
    community_type: 'HOSTEL',
    description: 'Boys and girls hostel blocks, mess and common rooms.',
    address: 'Greenview Road, next to Northfield Campus',
    created_at: '2026-07-22T09:00:00+05:30',
  },
  {
    community_id: 'lakeside-residency',
    name: 'Lakeside Residency',
    community_type: 'RESIDENTIAL_COLONY',
    description: 'Homes, the central park, clubhouse and market.',
    address: 'Lakeside Residency, Sector 9',
    created_at: '2026-07-25T09:00:00+05:30',
  },
]

export const community_memberships = [
  { membership_id: 'm-1', community_id: 'northfield-college', user_id: 'user-aarav', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-01T09:05:00+05:30' },
  { membership_id: 'm-2', community_id: 'greenview-hostel', user_id: 'user-aarav', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-01T09:10:00+05:30' },
  { membership_id: 'm-3', community_id: 'northfield-college', user_id: 'user-ananya', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-02T10:05:00+05:30' },
  { membership_id: 'm-4', community_id: 'northfield-college', user_id: 'user-rohan', role: 'COMMUNITY_ADMIN', membership_status: 'ACTIVE', joined_at: '2026-08-02T11:35:00+05:30' },
  { membership_id: 'm-5', community_id: 'northfield-college', user_id: 'user-kabir', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-04T15:05:00+05:30' },
  { membership_id: 'm-6', community_id: 'greenview-hostel', user_id: 'user-kabir', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-04T15:10:00+05:30' },
  { membership_id: 'm-7', community_id: 'greenview-hostel', user_id: 'user-meera', role: 'COMMUNITY_ADMIN', membership_status: 'ACTIVE', joined_at: '2026-08-05T18:25:00+05:30' },
  { membership_id: 'm-8', community_id: 'lakeside-residency', user_id: 'user-priya', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-10T08:50:00+05:30' },
  { membership_id: 'm-9', community_id: 'lakeside-residency', user_id: 'user-arjun', role: 'COMMUNITY_ADMIN', membership_status: 'ACTIVE', joined_at: '2026-08-11T12:15:00+05:30' },
]

export const categories = [
  { category_id: 'electronics', category_name: 'Electronics' },
  { category_id: 'bags', category_name: 'Bags' },
  { category_id: 'documents', category_name: 'Documents' },
  { category_id: 'clothing', category_name: 'Clothing' },
  { category_id: 'accessories', category_name: 'Accessories' },
  { category_id: 'keys', category_name: 'Keys' },
  { category_id: 'water-bottles', category_name: 'Water Bottles' },
  { category_id: 'other', category_name: 'Other' },
]

