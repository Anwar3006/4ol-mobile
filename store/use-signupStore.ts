import { create } from "zustand";

type SignUpState = {
  first_name: string;
  last_name: string;
  dob: string;
  sex: string;
  email: string;
  phone_number: string;

  setStep1Data: (data: {
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
  }) => void;
  setPhoneNumber: (phone: string) => void;
};

export const useSignUpStore = create<SignUpState>((set) => ({
  first_name: "",
  last_name: "",
  dob: "",
  sex: "",
  email: "",
  phone_number: "",
  setStep1Data: (data) => set(data),
  setPhoneNumber: (phone) => set({ phone_number: phone }),
}));
