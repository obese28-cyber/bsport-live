package com.bsport.live;
import android.app.Activity;import android.os.Bundle;import android.view.View;import android.webkit.WebView;import android.webkit.WebViewClient;import android.webkit.WebChromeClient;import android.webkit.WebSettings;
public class MainActivity extends Activity {
 WebView web;
 @Override public void onCreate(Bundle b){super.onCreate(b);getWindow().addFlags(128);getWindow().getDecorView().setSystemUiVisibility(5894|1024|512);web=new WebView(this);setContentView(web);web.setWebViewClient(new WebViewClient());web.setWebChromeClient(new WebChromeClient());WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(true);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);web.loadUrl("file:///android_asset/index.html");}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
}