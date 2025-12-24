cd /Users/anwarsadat/Desktop/WORK/4-Our-Life-App

# Clean watchman

watchman watch-del-all

# Clear Metro bundler cache

rm -rf $TMPDIR/react-_
rm -rf $TMPDIR/metro-_

# Clear node modules

rm -rf node_modules
npm install

# Clean iOS build folders

cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/\*
