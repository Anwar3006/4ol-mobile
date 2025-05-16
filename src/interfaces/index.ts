import {ReactNode} from 'react';
import {InteractionManager} from 'react-native';
import {SCREENS} from '../constants/screens';

export interface CategoryItem {
  id: string | number | undefined;
  icon: ReactNode; // ReactNode to support JSX elements
  title: string | undefined;
  screen: string | undefined;
}

export interface TopRatedItem {
  id: string;
  name: string;
  ratings: number;
  distance: string;
}

export interface StackParams {
  GetStarted: string | undefined;
  Splash: string | undefined;
  Profile: string | undefined;
}

export interface MainStackparams {}

export interface PhoneNumberSchema {
  phoneNumber: string | undefined;
}

export interface EmailAddressSchema {
  phoneNumber: string | undefined;
  passcode: string | undefined;
}

export interface ForgetEmailAddressSchema {
  emailOrPhone: string | undefined;
}

export interface ForgetPhoneNumberSchema {
  emailOrPhone: any;
}

export interface SignUpSchema {
  first_name: string | undefined;
  last_name: string | undefined;
  sex: string | undefined;
  dob: string | undefined;
  email: string | undefined;
  password: string | undefined;
  region: string | undefined;
  confirm_password: string | undefined;
}

export interface ResetpasswordSchema {
  newPin: string | undefined;
  confirmPin: string | undefined;
}

export interface BottomTabSchema {
  Home: string | undefined;
  Locator: string | undefined;
  PillsReminder: string | undefined;
  SavedItems: string | undefined;
  Settings: string | undefined;
}

export interface NavigationStackParams {
  Splash: string | undefined;
  GetStarted: string | undefined;
  SignUp: string | undefined;
  VerifyPhoneNumber: string | undefined;
  OtpVerification: string;
  Login: string | undefined;
  ForgotPassword: string | undefined;
  ResetPassword: string | undefined;
  ChangePassword: string | undefined;
  BottomNavigation: string | undefined;
  Home: string | undefined;
  Diseases: string | undefined;
  DiseasesList: string | undefined;
  Diseasesdetails: string | undefined;
  Symptoms: string | undefined;
  ListOfSymptoms: string | undefined;
  SymptomDetails: string | undefined;
  SearchResults: string | undefined;
  Categories: string | undefined;
  TopRated: string | undefined;
  FacilityDetails: string | undefined;
  Direction: string | undefined;
  Locator: string | undefined;
  PillsReminder: string | undefined;
  AddMedication: string | undefined;
  MedicationTimeSlots: string | undefined;
  savedItems: string | undefined;
  Settings: string | undefined;
  profile: string | undefined;
  AddMedicationContinue: string | undefined;
  EditMedication: string | undefined;
  CategoryResultsScreen: {
    category: string;
    searchQuery: string;
  };
}

export interface updateProfileSchema {
  first_name: string | undefined;
  last_name: string | undefined;
  sex: string | undefined;
  dob: string | Date;
  email: string | undefined;
  emailOrPhone: string | undefined;
  // password: string | undefined;
  // confirm_password: string | undefined;
}

export interface MedicationSchedule {
  medication_name: string; // Medication name
  medication_description: string; // Description of the medication
  days: string[] | string; // Days (can be an array or a single string based on real value visibility)
  user_id: string; // User ID
  type: string; // Type of schedule or interval intake
  how_many_times: number; // How many times the medication is taken
  intake_times: string[]; // Array of intake times
  quantity_per_intake: number; // Quantity to be taken per intake
  start_date: string; // Start date in YYYY-MM-DD format
  end_date: string; // End date in YYYY-MM-DD format
  regular_notifications: boolean; // Indicates if regular notifications are enabled
  created_at: number; // Timestamp of creation (milliseconds)
  updated_at: number; // Timestamp of last update (milliseconds)
  created_by: string; // User ID of creator
  updated_by: string; // User ID of last updater
  is_created_by_admin_panel: boolean; // Whether the schedule was created by admin panel
}

export interface RealValueVisible {
  dayselect: boolean; // Visibility of day selection
  schedule: boolean; // Visibility of schedule
  intervalIntake: boolean; // Visibility of interval intake
  quantityPerIntake: boolean; // Visibility of quantity per intake
  startDate: boolean; // Visibility of start date
  EndDate: boolean; // Visibility of end date
  regularNotifications: boolean; // Visibility of regular notifications
}

// Define the TypeScript interface for MedicationDetailsData
interface MedicationsDetailsData {
  color: string; // "#63605C"
  created_at: number; // Unix timestamp 1729598383088
  created_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
  days: string; // "Weekly"
  days_of_the_week: string[] | null; // Can be an array of strings or null
  end_date: string; // "2024-10-23" (ISO date string)
  how_many_times: number; // 1
  id: string; // UUID "b9199573-58b1-4ad9-b623-debe061bbbd6"
  intake_days: string[] | null; // Array of intake days or null
  intake_times: string[]; // Array of times like ["05:00 PM on 2024-10-22"]
  is_created_by_admin_panel: boolean; // false
  medication_description: string; // "Maba"
  medication_name: string; // "Nag"
  medicine_image: string; // "avatar"
  medicine_type: string; // "Tablet"
  quantity_per_intake: number; // 1
  regular_notifications: boolean; // false
  start_date: string; // "2024-10-22" (ISO date string)
  type: string; // "schedule"
  updated_at: number; // Unix timestamp 1729598383088
  updated_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
  user_id: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
}

export interface medicationsDetailsData {
  color: string; // "#63605C"
  created_at: number; // Unix timestamp 1729598383088
  created_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
  days: string; // "Weekly"
  days_of_the_week: string[] | null; // Can be an array of strings or null
  end_date: string; // "2024-10-23" (ISO date string)
  how_many_times: number; // 1
  id: string; // UUID "b9199573-58b1-4ad9-b623-debe061bbbd6"
  intake_days: string[] | null; // Array of intake days or null
  intake_times: string[]; // Array of times like ["05:00 PM on 2024-10-22"]
  is_created_by_admin_panel: boolean; // false
  medication_description: string; // "Maba"
  medication_name: string; // "Nag"
  medicine_image: string; // "avatar"
  medicine_type: string; // "Tablet"
  quantity_per_intake: number; // 1
  regular_notifications: boolean; // false
  start_date: string; // "2024-10-22" (ISO date string)
  type: string; // "schedule"
  updated_at: number; // Unix timestamp 1729598383088
  updated_by: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
  user_id: string; // UUID "707cc7d3-30a8-4ead-a495-f449a1881087"
}

// Define the TypeScript interface for route.params
export interface RouteParams {
  color: string; // "#63605C"
  editcondition: string; // "Maba"
  editname: string; // "Nag"
  image: string; // "avatar"
  medicationsDetailsData: MedicationsDetailsData; // Nested MedicationsDetailsData object
  type: string; // "Tablet"
}

export interface StateType {
  changeSchedule: string;
  selectedCount: string;
}

export interface SelectedDay {
  day: string;
  isChecked: boolean;
}

export interface ScheduleObject {
  schedule_dates: string;
  status: string;
  utcTime: string;
  schedule_times: string[];
  utc_schedule_dates: string;
  utc_schedule_times: string[];
  // utc_schedule_times: string[];
}

// export interface PeriodsTrackerStack {
//   PeriodConsentAndPolicies: string|undefined; // Use undefined if the screen doesn't expect any parameters
// }

export interface CheckBoxes {
  isChecked: boolean;
  isChecked2: boolean;
}

export interface TrackerLog {
  created_at: number;
  flow_types: {date: string; selectedFlow: string}[];
  goal: string;
  id: number;
  is_consistent: string;
  period_start_date: string;
  period_length: number;
}

export interface FlowType {
  date: string;
  selectedFlow: string;
}

export interface PeriodTrackerData {
  id: number;
  created_at: number;
  goal: string;
  cycle_length: number;
  period_length: number;
  is_consistent: string;
  period_start_date: string;
  flow_types: FlowType[];
  next_reminder: string;
  next_reminder_utc: string;
  period_start_date_utc: string;
  updated_at: number;
  updated_by: string;
  created_by: string;
  user_id: string;
  is_created_by_admin_panel: boolean;
}

export interface FiltersProps {
  Hospital: {
    type: string;
    keyword: string;
  };
  Herbal: {
    type: string;
    keyword: string;
  };
  Laboratory: {
    type: string;
    keyword: string;
  };
  Ambulance: {
    type: string;
    keyword: string;
  };
  Pharmacy: {
    type: string;
    keyword: string;
  };
  Wholesale: {
    type: string;
    keyword: string;
  };
  'Display All': {
    keyword: string;
  };
}
