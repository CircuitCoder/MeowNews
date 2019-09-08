# MeowNews

> JavaScript 为什么不算 Java?

# Building

```bash
yarn --frozen-lockfile
yarn global add expo

expo export --public-url https://FRONTEND_FQDN/meow-news
# Upload dist onto your server, and change your production url
editor android/app/src/main/java/host/exp/exponent/MainActivity.java

cd android
./gradlew assembleRelease

# You can find your built apk at android/app/build/outputs/apk/release/app-release.apk
```
