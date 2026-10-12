#!/usr/bin/env python3
"""Gem Guardians - Android TEST app project generator.

Used by .github/workflows/android-apk.yml. It writes a small Android Studio/Gradle project
that packs the game files from this repository inside the app (fully offline WebView app),
then GitHub Actions builds GemGuardians-test.apk and publishes it as the "test-apk" release.

The signing key below is a TEST-ONLY key. Never use it for Google Play.
Usage: python3 android-build.py <repo_dir> <output_dir>
"""
import base64, os, re, shutil, sys

REPO, OUT = sys.argv[1], sys.argv[2]
PKG = 'io.github.joshualpers143.gemguardians'

JAVA = r'''package io.github.joshualpers143.gemguardians;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * Gem Guardians Android app: the complete game runs offline from files packed inside the app.
 * Game saves live in this app's own storage (separate from the browser version; use Export/Import to move them).
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/www/index.html";
    private static final int PICK_FILE = 4711;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    // Runs after every page load: phone landscape lock during full-screen battles,
    // save-backup downloads, and the always-on screen (the app keeps the screen awake itself).
    private static final String BRIDGE_JS =
        "(function(){if(window.__ggApp)return;window.__ggApp=1;" +
        "var a=document.getElementById('arena');" +
        "if(a&&window.MutationObserver){new MutationObserver(function(){GGAndroid.setLandscape(a.classList.contains('map-fullscreen'));}).observe(a,{attributes:true,attributeFilter:['class']});}" +
        "var revoke=URL.revokeObjectURL;URL.revokeObjectURL=function(u){setTimeout(function(){revoke.call(URL,u)},15000);};" +
        "var click=HTMLAnchorElement.prototype.click;" +
        "HTMLAnchorElement.prototype.click=function(){var h=this.href||'',n=this.download;" +
        "if(n&&(h.indexOf('blob:')===0||h.indexOf('data:')===0)){fetch(h).then(function(r){return r.blob()}).then(function(b){var fr=new FileReader();fr.onload=function(){GGAndroid.saveFile(n,String(fr.result).split(',')[1]||'');};fr.readAsDataURL(b);});return;}" +
        "return click.apply(this,arguments);};" +
        "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#15122a"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#15122a"));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);
        hideSystemBars();

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);

        web.addJavascriptInterface(new Bridge(), "GGAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                view.evaluateJavascript(BRIDGE_JS, null);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    startActivityForResult(Intent.createChooser(i, "Choose Gem Guardians save backup"), PICK_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START);
    }

    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == PICK_FILE && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[]{data.getData()};
            fileCallback.onReceiveValue(result);
            fileCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        // The game handles Back itself (closes menus first, double-press to exit) through browser history.
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        if (web != null) {
            web.evaluateJavascript("try{save(false)}catch(e){};try{GGS.ctx&&GGS.ctx.suspend()}catch(e){}", null);
            web.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
            web.evaluateJavascript("try{GGS.ctx&&!GGS.prefs.muted&&GGS.ctx.resume()}catch(e){}", null);
        }
        hideSystemBars();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (web != null) web.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    private class Bridge {
        @JavascriptInterface
        public void setLandscape(final boolean on) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    setRequestedOrientation(on ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
                                               : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
                }
            });
        }

        @JavascriptInterface
        public void saveFile(final String name, final String base64) {
            String message;
            try {
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    v.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                    v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri == null) throw new Exception("Could not create the file");
                    OutputStream out = getContentResolver().openOutputStream(uri);
                    if (out == null) throw new Exception("Could not open the file");
                    out.write(bytes);
                    out.close();
                    message = "Saved to Downloads: " + safe;
                } else {
                    File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    File f = new File(dir, safe);
                    FileOutputStream out = new FileOutputStream(f);
                    out.write(bytes);
                    out.close();
                    message = "Saved: " + f.getAbsolutePath();
                }
            } catch (Exception e) {
                message = "Save backup failed: " + e.getMessage();
            }
            final String m = message;
            runOnUiThread(new Runnable() {
                @Override public void run() { Toast.makeText(MainActivity.this, m, Toast.LENGTH_LONG).show(); }
            });
        }
    }
}
'''
ICON_BG = r'''<vector xmlns:android="http://schemas.android.com/apk/res/android" xmlns:aapt="http://schemas.android.com/aapt" android:width="108dp" android:height="108dp" android:viewportWidth="1024" android:viewportHeight="1024">
<path android:pathData="M0,0h1024v1024h-1024z"><aapt:attr name="android:fillColor"><gradient android:type="radial" android:centerX="512" android:centerY="430" android:gradientRadius="717"><item android:offset="0" android:color="#FF5B3FB0"/><item android:offset="0.55" android:color="#FF2A1B5E"/><item android:offset="1" android:color="#FF120C2B"/></gradient></aapt:attr></path>
<path android:fillColor="#8CFFFFFF" android:pathData="M165,210a5,5 0 1,0 10,0a5,5 0 1,0 -10,0ZM856,170a4,4 0 1,0 8,0a4,4 0 1,0 -8,0ZM815,820a5,5 0 1,0 10,0a5,5 0 1,0 -10,0ZM206,830a4,4 0 1,0 8,0a4,4 0 1,0 -8,0ZM117,520a3,3 0 1,0 6,0a3,3 0 1,0 -6,0ZM907,520a3,3 0 1,0 6,0a3,3 0 1,0 -6,0Z"/>
</vector>'''
ICON_FG = r'''<vector xmlns:android="http://schemas.android.com/apk/res/android" xmlns:aapt="http://schemas.android.com/aapt" android:width="108dp" android:height="108dp" android:viewportWidth="1024" android:viewportHeight="1024">
<group android:pivotX="512" android:pivotY="512" android:scaleX="0.68" android:scaleY="0.68">
<path android:pathData="M92,500a420,420 0 1,0 840,0a420,420 0 1,0 -840,0Z"><aapt:attr name="android:fillColor"><gradient android:type="radial" android:centerX="512" android:centerY="500" android:gradientRadius="420"><item android:offset="0" android:color="#BF9EF0FF"/><item android:offset="0.45" android:color="#598B6CFF"/><item android:offset="1" android:color="#008B6CFF"/></gradient></aapt:attr></path>
<path android:pathData="M162,512a350,350 0 1,0 700,0a350,350 0 1,0 -700,0Z" android:strokeWidth="26"><aapt:attr name="android:strokeColor"><gradient android:type="linear" android:startX="512" android:startY="149" android:endX="512" android:endY="875"><item android:offset="0" android:color="#F2FFE9A3"/><item android:offset="1" android:color="#F2C98A1B"/></gradient></aapt:attr></path>
<path android:pathData="M190,512a322,322 0 1,0 644,0a322,322 0 1,0 -644,0Z" android:strokeWidth="4" android:strokeColor="#80FFE9A3"/>
<group android:pivotX="60" android:pivotY="62" android:scaleX="4.1" android:scaleY="4.1" android:translateX="452" android:translateY="458"><path android:pathData="M30,18H90L112,46L60,112L8,46Z"><aapt:attr name="android:fillColor"><gradient android:type="linear" android:startX="60" android:startY="18" android:endX="60" android:endY="112"><item android:offset="0" android:color="#FF9B7BFF"/><item android:offset="1" android:color="#FF3B1F9E"/></gradient></aapt:attr></path><path android:pathData="M30,18L44,46H76L90,18Z" android:fillColor="#FFD6F8FF"/><path android:pathData="M8,46H44L30,18Z" android:fillColor="#FF8FD9FF"/><path android:pathData="M112,46H76L90,18Z" android:fillColor="#FF5AA8FF"/><path android:pathData="M8,46H44L60,112Z"><aapt:attr name="android:fillColor"><gradient android:type="linear" android:startX="8" android:startY="46" android:endX="60" android:endY="112"><item android:offset="0" android:color="#FFF0FDFF"/><item android:offset="0.45" android:color="#FF7FE3FF"/><item android:offset="1" android:color="#FF3A6CFF"/></gradient></aapt:attr></path><path android:pathData="M44,46H76L60,112Z" android:fillColor="#FF6FC8FF"/><path android:pathData="M76,46H112L60,112Z" android:fillColor="#FF4560E8"/><path android:pathData="M30,18H90L112,46L60,112L8,46Z" android:strokeColor="#FFF4FBFF" android:strokeWidth="3" android:strokeLineJoin="round"/><path android:pathData="M36,24L46,40" android:strokeColor="#E6FFFFFF" android:strokeWidth="3" android:strokeLineCap="round"/></group>
<path android:fillColor="#FFFFFFFF" android:pathData="M800,250l10,28 28,10 -28,10 -10,28 -10,-28 -28,-10 28,-10z"/>
<path android:fillColor="#D9FFFFFF" android:pathData="M245,730l7,19 19,7 -19,7 -7,19 -7,-19 -19,-7 19,-7z"/>
</group>
</vector>'''
KEYSTORE = '/u3+7QAAAAIAAAABAAAAAQAGZ2d0ZXN0AAABoS0iM5wAAAB9MHswDAYKKwYBBAEqAhEBAQRrMUfMixTuo74xI9CYFgpuj1Mew/WunLEF6ufq2WQipH9s2tbWGzzu3sjKYe76WNinaC71txPN2YkqETSXXiuf3pgZND44yTImjQAbHw/qFlDR90Q/UKlSAKjMJFkASbPcYct6zMDUD/kMQwoAAAABAAVYLjUwOQAAAVYwggFSMIH6oAMCAQICCQCQQdVant5vzDAKBggqhkjOPQQDAjAdMRswGQYDVQQDExJHZW0gR3VhcmRpYW5zIFRlc3QwIBcNMjYxMDExMjI0MjU4WhgPMjA1NDAyMjYyMjQyNThaMB0xGzAZBgNVBAMTEkdlbSBHdWFyZGlhbnMgVGVzdDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABB1asrln9au+RwYQh40VL8e0miRFEiwbRT0EgwItXGG7bD4AN4/M75fgKPPQ/HtuCVPWTzUbo+q9YjgB3fAMT8qjITAfMB0GA1UdDgQWBBRgEhJ/88bv+/Gb2k6rpwIp+zN3uTAKBggqhkjOPQQDAgNHADBEAiADeGNQtBk30XnfVhUtOJchk+8VDXXEoB0yYDomHKqTeQIgKlOdkW4cNc7yK2hiTUft6stasC9GwW5jl6DPZpcUX4wlSzAeK8fA1p86ATZH+YnBqRDnAw=='

def write(path, data, binary=False):
    p = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'wb' if binary else 'w', **({} if binary else {'encoding': 'utf-8'})) as f:
        f.write(data)

index = open(os.path.join(REPO, 'index.html'), encoding='utf-8').read()
m = re.search(r"const GAME_VERSION='([^']+)'", index)
version_name = m.group(1) if m else '0'
version_code = int(os.environ.get('GG_VERSION_CODE', '1'))

if os.path.isdir(OUT):
    shutil.rmtree(OUT)

write('settings.gradle', """pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories { google(); mavenCentral() }
}
rootProject.name = 'GemGuardians'
include ':app'
""")
write('build.gradle', "plugins { id 'com.android.application' version '8.5.2' apply false }\n")
write('gradle.properties', "android.useAndroidX=true\norg.gradle.jvmargs=-Xmx2g\n")
write('app/build.gradle', f"""plugins {{ id 'com.android.application' }}
android {{
  namespace '{PKG}'
  compileSdk 34
  defaultConfig {{
    applicationId '{PKG}.test'
    minSdk 24
    targetSdk 34
    versionCode {version_code}
    versionName '{version_name}-test'
  }}
  signingConfigs {{
    test {{
      storeFile file('test-keystore.jks')
      storePassword 'ggtest-only'
      keyAlias 'ggtest'
      keyPassword 'ggtest-only'
    }}
  }}
  buildTypes {{
    release {{ minifyEnabled false; signingConfig signingConfigs.test }}
    debug {{ signingConfig signingConfigs.test }}
  }}
  compileOptions {{ sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }}
  androidResources {{ noCompress += ['html', 'js', 'json', 'webmanifest'] }}
}}
dependencies {{ implementation 'androidx.webkit:webkit:1.11.0' }}
""")
write('app/test-keystore.jks', base64.b64decode(KEYSTORE), True)
write('app/src/main/AndroidManifest.xml', """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <application android:label="Gem Guardians" android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round" android:allowBackup="true"
      android:theme="@style/GGTheme" android:hardwareAccelerated="true">
    <activity android:name=".MainActivity" android:exported="true" android:launchMode="singleTask"
        android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|smallestScreenSize|uiMode"
        android:windowSoftInputMode="adjustResize">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
""")
write('app/src/main/res/values/styles.xml', """<?xml version="1.0" encoding="utf-8"?>
<resources>
  <style name="GGTheme" parent="android:Theme.Material.NoActionBar">
    <item name="android:windowBackground">@color/gg_bg</item>
    <item name="android:statusBarColor">@color/gg_bg</item>
    <item name="android:navigationBarColor">@color/gg_bg</item>
  </style>
  <color name="gg_bg">#15122a</color>
</resources>
""")
adaptive = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/ic_launcher_background" />
  <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
"""
write('app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', adaptive)
write('app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', adaptive)
write('app/src/main/res/drawable/ic_launcher_background.xml', ICON_BG)
write('app/src/main/res/drawable/ic_launcher_foreground.xml', ICON_FG)
# Older Android (7.x) uses the regular game icon.
for name in ('ic_launcher.png', 'ic_launcher_round.png'):
    write('app/src/main/res/mipmap-xxxhdpi/' + name, open(os.path.join(REPO, 'icon-512.png'), 'rb').read(), True)
write('app/src/main/java/' + PKG.replace('.', '/') + '/MainActivity.java', JAVA)

# Game files packed inside the app. The service worker is switched off (the files are already local)
# and the screen wake lock is handled by the app itself.
SHIM = ("<script>try{delete Navigator.prototype.serviceWorker}catch(e){}"
        "try{Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:function(){"
        "var l={released:false,type:'screen',addEventListener:function(){},removeEventListener:function(){},"
        "release:function(){l.released=true;return Promise.resolve()}};return Promise.resolve(l)}}})}catch(e){}"
        "window.GG_ANDROID_APP=true;</script>")
if index.count('<head>') != 1:
    raise SystemExit('index.html: expected exactly one <head>')
write('app/src/main/assets/www/index.html', index.replace('<head>', '<head>' + SHIM, 1))
copied = ['index.html']
for f in sorted(os.listdir(REPO)):
    if f == 'index.html' or f == 'sw.js':
        continue
    if re.match(r'^(gg-[\w-]+\.js|manifest\.webmanifest|privacy\.html|icon-\d+\.png)$', f):
        shutil.copy(os.path.join(REPO, f), os.path.join(OUT, 'app/src/main/assets/www', f))
        copied.append(f)
for need in ('gg-game.js', 'gg-art.js', 'gg-sound.js'):
    if need not in copied:
        raise SystemExit('missing game file: ' + need)
print('Android project ready:', OUT, '| version', version_name, '| code', version_code, '| files', ', '.join(copied))
