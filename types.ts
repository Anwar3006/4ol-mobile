export type UserStore = {
  user: MobileUserProfile | null;
  setUser: (user: MobileUserProfile | null) => void;
  logoutUser: () => void;
  // Removed: isLoggingOut and setIsLoggingOut
  // Now using BetterAuth's isPending as single source of truth
};

export type MobileUserProfile = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  dob: string;
  sex: string;
  role: string;
  user_type: string;
  avatar_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
