# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# ===== Notifee Proguard Rules =====
-keep class io.invertase.notifee.** { *; }

# Firebase Messaging support (if you use Firebase Cloud Messaging with Notifee)
-keep class com.google.firebase.messaging.FirebaseMessagingService { *; }
-keep class com.google.firebase.iid.FirebaseInstanceIdService { *; }
-keep class com.google.firebase.** { *; }

# React Native core (optional but recommended for log visibility)
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# If using reflection, retain annotations
-keepattributes *Annotation*, Signature, InnerClasses

# Suppress warnings
-dontwarn io.invertase.notifee.**
