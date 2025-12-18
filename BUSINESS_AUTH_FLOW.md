# New Feature - Facility/Business Auth + View Switch Capabilities for Facility Managers

## Facility/Business Authentication

1. Business Providers/Facility Managers will click on the [Login as Business button](src/screens/authStack/GetStarted.tsx#L65). - **Implemented**
2. A Modal/Dialog will open up asking them: `Has your business/facility been registered. You would know this if our team visited your facility to manually register you. If not then proceed to register yourself. Choose Yes or No to proceed` - Not Implemented yet - **Not Implemented Yet**
3. Add the Stacks for navigation. [Add Stacks](src/navigation/AuthStackNavigation.tsx#L163)
   - One for the actual Login for Facilities which will display the form. - **Not Implemented Yet**
   - One for the Registration of IBPs. - **Not Implemented Yet**
4. When Business Provider clicks on `Yes` they will be navigated to Login for Business Screen - **Not Implemented Yet**
   - When they click on `No`, they will be navigated `Register Your Facility` Screen - **Not Implemented Yet**
5. We will register this IBP within the Facilities Table. To do this we need to ensure some modifications in the `Add Facility` Page from the Admin Side:
   - Add Facility Form has Owner Name split between First Name and Last while IBP form has FullName -> Prefer the split so we can render FirstName.
   - Add Facility Form has Facility Name while IBP form has Business Name
   - Add Facility Form has Facility Contact while IBP form has None -> IBP may have a business contact which isnt being captured
   - Add Facility form has WhatsApp Number and Email which isnt being captured in IBP form -> IBP may have a separate business email
   - Add Facility form has GPS Address which is auto-populated during registration while IBP form has Physical Address which user has to type in -> Suggest we reuse the autofill and caution IBPs to only register when they are with the premises of their facilities as their application may be rejected if upon review there are discrepancies with the location.
   - Add Facility form has Services while IBP form has Business/Service type -> I assume these two require the same data but one has multi-select input(in the Add Facility form) and one requires a comma-separated text input -> Prefer Multi-Select.
   - Add Facility form has keywords while IBP form has Specialization/Services offered -> keywords in a comma-separated text input similar to Specializations which appears to be a TextArea. Prefer Multi-Select Input(CheckBoxes) for simplicity and it gives users a whole list of ready prepared specializations to choose from thus we need to refactor the existing keywords field in the Add Facility form.
   - Add Facility form doesn't have a Professional Qualification field Services while IBP form has Business/Service typ
   - IBP will need Business Operation hours which is On Add Facility Form but not on IBP form
   - Proposed Decision inlight of the above:
     - Use the same Facility form for IBPs as well as it captures more data
     - Using the same form means we can use the same table which reduces the number of tables to track and reduces<br> Redundancy. This also means when we are querying for Facilities we do not have to visit multiple tables to get our response which reduces latency as the tables grow.

## View Switch - Attached PDF file
