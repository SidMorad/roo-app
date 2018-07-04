package ir.adad.cordova;

import android.app.Activity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
import ir.adad.client.Adad;
import ir.adad.client.Banner;
import java.lang.reflect.Method;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AdadAd extends org.apache.cordova.CordovaPlugin
{
  private static final String LOG_TAG = "Cordova Adad";
  private static CallbackContext callbackContextKeepCallback = null;
  private static Activity mActivity = null;
  public CordovaInterface cordova = null;
  protected Banner adadBanner;
  private static final int POSITION_TOP = 100;
  private static final int POSITION_BOTTOM = 101;

  public AdadAd() {}

  public void initialize(CordovaInterface initCordova, org.apache.cordova.CordovaWebView webView) { android.util.Log.e("MilaDesign Adad", "initialize");
    cordova = initCordova;
    super.initialize(cordova, webView);
  }

  public boolean execute(String action, JSONArray args, CallbackContext CallbackContext)
    throws JSONException
  {
    if (action.equals("setUp")) {
      setUp(action, args, CallbackContext);
      return true;
    }
    if (action.equals("addBanner")) {
      addBanner(action, args, CallbackContext);
      return true;
    }
    if (action.equals("enableBanner")) {
      enableBanner(action, args, CallbackContext);
      return true;
    }
    if (action.equals("disableBanner")) {
      disableBanner(action, args, CallbackContext);
      return true;
    }
    if (action.equals("loadInterstitialAd")) {
      loadInterstitialAd(action, args, CallbackContext);
      return true;
    }
    if (action.equals("showInterstitialAd")) {
      showInterstitialAd(action, args, CallbackContext);
      return true;
    }
    return false;
  }

  private void setUp(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    callbackContextKeepCallback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable()
    {
      public void run() {
        AdadAd.this._setUp();
      }
    });
  }

  private void addBanner(String action, JSONArray args, CallbackContext callbackContext) throws JSONException
  {
    callbackContextKeepCallback = callbackContext;
    final int position = args.getInt(0);
    cordova.getActivity().runOnUiThread(new Runnable()
    {
      public void run() {
        try {
          AdadAd.this._addBanner(position);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    });
  }

  private void enableBanner(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    callbackContextKeepCallback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable()
    {
      public void run() {
        AdadAd.this._enableBanner();
      }
    });
  }

  private void disableBanner(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    callbackContextKeepCallback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable()
    {
      public void run() {
        AdadAd.this._disableBanner();
      }
    });
  }

  private void loadInterstitialAd(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    callbackContextKeepCallback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable()
    {
      public void run() {
        AdadAd.this._loadInterstitialAd(AdadAd.callbackContextKeepCallback);
      }
    });
  }

  private void showInterstitialAd(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    cordova.getActivity().runOnUiThread(new Runnable()
    {
      public void run() {
        AdadAd.this._showInterstitialAd();
      }
    });
  }

  private void _setUp() {
    mActivity = cordova.getActivity();
    Adad.initialize(mActivity.getApplicationContext());
    callbackContextKeepCallback.success();
  }

  private void _addBanner(int position) throws JSONException {
    mActivity = cordova.getActivity();
    int i = position;
    FrameLayout bannerLayout = new FrameLayout(mActivity);
    FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(-2, -2);
    switch (i) {
    case 100:
      gravity = 49;
      break;
    case 101:
      gravity = 81;
    }
    bannerLayout.setLayoutParams(fLayoutParams);
    ((ViewGroup)getParentGroup().getParent()).addView(bannerLayout, 1);
    Banner banner = new Banner(mActivity);
    bannerLayout.addView(banner);
    callbackContextKeepCallback.success();
  }

  private ViewGroup getParentGroup() {
    try {
      return (ViewGroup)webView.getClass().getMethod("getView", new Class[0]).invoke(webView, new Object[0]);
    } catch (Exception ex) {
      try {
        return (ViewGroup)webView.getClass().getMethod("getParent", new Class[0]).invoke(webView, new Object[0]);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  private void _enableBanner() {
    mActivity = cordova.getActivity();
    Adad.enableBannerAds();
    callbackContextKeepCallback.success();
  }

  private void _disableBanner() {
    mActivity = cordova.getActivity();
    Adad.disableBannerAds();
    callbackContextKeepCallback.success();
  }

  private void _loadInterstitialAd(CallbackContext callbackContext) {
    mActivity = cordova.getActivity();
    Adad.prepareInterstitialAd(new InterstitialAd());
    callbackContextKeepCallback = callbackContext;
  }

  private void _showInterstitialAd() {
    mActivity = cordova.getActivity();
    Adad.showInterstitialAd(mActivity);
  }

  class InterstitialAd implements ir.adad.client.InterstitialAdListener {
    InterstitialAd() {}

    public void onAdLoaded() {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, "onAdadAdLoaded");
      pr.setKeepCallback(true);
      AdadAd.callbackContextKeepCallback.sendPluginResult(pr);
    }

    public void onAdFailedToLoad()
    {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, "onAdadAdLoaded");
      pr.setKeepCallback(true);
      AdadAd.callbackContextKeepCallback.sendPluginResult(pr);
    }

    public void onMessageReceive(JSONObject paramJSONObject)
    {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, "onAdadMessageReceive");
      pr.setKeepCallback(true);
      AdadAd.callbackContextKeepCallback.sendPluginResult(pr);
    }

    public void onRemoveAdsRequested()
    {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, "onAdadRemoveAdsRequested");
      pr.setKeepCallback(true);
      AdadAd.callbackContextKeepCallback.sendPluginResult(pr);
    }

    public void onInterstitialAdDisplayed()
    {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, "onAdadInterstitialAdDisplayed");
      pr.setKeepCallback(true);
      AdadAd.callbackContextKeepCallback.sendPluginResult(pr);
    }

    public void onInterstitialClosed()
    {
      PluginResult pr = new PluginResult(PluginResult.Status.OK, "onAdadInterstitialClosed");
      pr.setKeepCallback(true);
      AdadAd.callbackContextKeepCallback.sendPluginResult(pr);
    }
  }
}