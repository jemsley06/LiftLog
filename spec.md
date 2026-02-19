# Project: LiftLog
**Vibe:** Aesthetic, modern, practical.
**Tech Stack:** React Native, NativeWind, ExpoRouter, Supabase.

## Core Functional Requirements
- **User Authentication:** User must be able to sign up, sign in, and sign out. User should stay signed in, even when the app closes and should 
- **1RM/Strength Calculation:** Single rep max (1RM) calculations will be made according to the Brzycki method. These calculations will be utilized in various features throughout the app that will be specified in later sections. Strength calculations (or perceived difficulty of a set) will be calculated as a percentage of the "best set" of the exercise, by comparing the individual set's 1RM to the set with the highest calculated 1RM. When a new "best set" is recorded, sets will not be retroactively scored and instead the calculations will use the new best set for all new sets moving forward.
- **Workout Logging:** User must be able to log workouts by recording sets of exercises with reps and weight, with date of set automatically recorded. Previous sets should be displayed by exercise, and users must be able to group exercises into "workouts" for their routines. Users will be prompted to progressively overload if they remain at the same or less weight and reps for a given exercise for multiple workouts.
- **Workout Display:** User must be able to view workout history for a given exercise and view trends in progress through graphical displays of weight and reps over time, as well as an option to view the increase in calculated 1RM over time. Progress for workouts should be displayed as a list containing each exercise and the percent increase of the calculated 1RM for the exercise over the set period of time determined by the user.
- **Group Lifts:** Users should be able to add friends within the app, view their PRs, and invite them to "parties" and start a group lift. Parties allow users to compete against each other in scored sessions, where each set is scored based on the intensity compared to the user's best set of the exercise. Users will have the option to end the group lift at any time, and the app will calculate the winner based on the highest score.

## Success Metrics
- Users should be easily log in and intuitively track their workouts and progress over time.
- Code should be optimized, modular, readable, and scalable.

## Future Features
- **Form Review through Video Upload:** Users should be able to upload videos of their lifts, which will be analyzed by machine learning algorithms to provide feedback on their form.