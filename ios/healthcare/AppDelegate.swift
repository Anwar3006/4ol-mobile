import Firebase
import GoogleMaps
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit

// import notifee

@main
class AppDelegate: RCTAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Initialize Google Maps SDK FIRST (before React Native)
    // This must be called before React Native initialization
    let iosGoogleMapsKey = "AIzaSyCweARjI2twXB4AxBOPI6vHJTer649bwJA"
    print("🗺️ [iOS] Initializing Google Maps SDK...")
    print("🗺️ [iOS] Google Maps API Key being used: \(iosGoogleMapsKey)")
    GMSServices.provideAPIKey(iosGoogleMapsKey)
    print("✅ [iOS] Google Maps SDK initialized successfully")

    self.moduleName = "healthcare"
    self.dependencyProvider = RCTAppDependencyProvider()
    //  Notifee.onBackgroundEvent()
    FirebaseApp.configure()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
