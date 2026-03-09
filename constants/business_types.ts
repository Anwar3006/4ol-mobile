export const BusinessTypesData = {
  'Retail & Trading': [
    {label: 'Supermarket / Grocery', value: 'Supermarket'},
    {label: 'Boutique / Clothing', value: 'Boutique'},
    {label: 'Electronics & Gadgets', value: 'Electronics'},
    {label: 'General Wholesale', value: 'Wholesale'},
  ],
  'Food & Drinks': [
    {label: 'Restaurant / Eatery', value: 'Restaurant'},
    {label: 'Cafe / Coffee Shop', value: 'Cafe'},
    {label: 'Catering Services', value: 'Catering'},
    {label: 'Bar / Pub', value: 'Bar'},
    {label: 'Bakery', value: 'Bakery'},
  ],
  Services: [
    {label: 'Laundry & Cleaning', value: 'Laundry'},
    {label: 'Beauty Salon / Barber', value: 'Salon'},
    {label: 'Auto Repair / Mechanic', value: 'Mechanic'},
    {label: 'Security Services', value: 'Security'},
  ],
  'Professional & Office Services': [
    {label: 'Consultancy', value: 'Consultancy'},
    {label: 'Legal Services', value: 'Legal'},
    {label: 'Accounting / Audit', value: 'Accounting'},
    {label: 'Marketing / PR', value: 'Marketing'},
  ],
  'Healthcare & Wellness': [
    {label: 'Fitness Center / Gym', value: 'Gym'},
    {label: 'Spa / Massage Therapy', value: 'Spa'},
  ],
  'Education & Training': [
    {label: 'Private School', value: 'PrivateSchool'},
    {label: 'Tuition / Coaching Center', value: 'Tuition'},
    {label: 'Vocational Training', value: 'Vocational'},
    {label: 'Creche / Nursery', value: 'Creche'},
  ],
  'Real Estate & Construction': [
    {label: 'Property Rental / Sales', value: 'Property'},
    {label: 'Architectural Services', value: 'Architecture'},
    {label: 'Construction Firm', value: 'Construction'},
    {label: 'Interior Design', value: 'InteriorDesign'},
  ],
  'Logistics & Transportation': [
    {label: 'Delivery / Courier', value: 'Delivery'},
    {label: 'Trucking / Haulage', value: 'Trucking'},
    {label: 'Car Rental', value: 'CarRental'},
    {label: 'Travel Agency', value: 'TravelAgency'},
  ],
  'Digital & Online Business': [
    {label: 'Online Store', value: 'Online Store'},
    {label: 'Social Media Selling', value: 'Social Media Selling'},
    {label: 'Web Development', value: 'Web Development'},
    {label: 'Software / SaaS', value: 'Software / SaaS'},
    {label: 'Graphic Design', value: 'Graphic Design'},
    {label: 'Content Creation', value: 'Content Creation'},
    {label: 'Freelancing Services', value: 'Freelancing Services'},
  ],
  'Events, Media & Creative': [
    {label: 'Event Planning', value: 'Event Planning'},
    {label: 'Photography', value: 'Photography'},
    {label: 'Videography', value: 'Videography'},
    {label: 'DJ / MC Services', value: 'DJ / MC Services'},
    {label: 'Graphic Design', value: 'Graphic Design'},
    {label: 'Media Production', value: 'Media Production'},
  ],
};

// Extract keys for the first dropdown
export const BusinessTypeOptions = Object.keys(BusinessTypesData).map(key => ({
  label: key,
  value: key,
}));
