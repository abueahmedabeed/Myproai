import fs from 'fs';
const J='android/app/src/main/java/com/mpro/ai/',M='android/app/src/main/AndroidManifest.xml',R='android/app/src/main/res/';
fs.mkdirSync(J,{recursive:true});fs.mkdirSync(R+'xml',{recursive:true});
fs.writeFileSync(J+'MainActivity.java',String.raw`package com.mpro.ai;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
 @Override public void onCreate(Bundle b){
  registerPlugin(PhoneControlPlugin.class);
  super.onCreate(b);
  ActivityCompat.requestPermissions(this,new String[]{"android.permission.RECORD_AUDIO","android.permission.CALL_PHONE","android.permission.READ_CONTACTS","android.permission.CAMERA"},1);
 }
}`);
fs.writeFileSync(J+'PhoneAccessibilityService.java',String.raw`package com.mpro.ai;
import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.content.Intent;
import android.graphics.Path;
import android.os.Handler;
import android.os.Looper;
import android.util.DisplayMetrics;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;
public class PhoneAccessibilityService extends AccessibilityService {
 static PhoneAccessibilityService inst;
 static final Handler H=new Handler(Looper.getMainLooper());
 @Override protected void onServiceConnected(){inst=this;}
 @Override public boolean onUnbind(Intent i){inst=null;return super.onUnbind(i);}
 @Override public void onAccessibilityEvent(AccessibilityEvent e){}
 @Override public void onInterrupt(){}
 static boolean on(){return inst!=null;}
 static void global(int a){if(inst!=null)inst.performGlobalAction(a);}
 static void swipe(float x1,float y1,float x2,float y2){
  if(inst==null)return;
  Path p=new Path();p.moveTo(x1,y1);p.lineTo(x2,y2);
  inst.dispatchGesture(new GestureDescription.Builder().addStroke(new GestureDescription.StrokeDescription(p,0,350)).build(),null,null);
 }
 static void scroll(boolean down){
  if(inst==null)return;
  DisplayMetrics m=inst.getResources().getDisplayMetrics();float w=m.widthPixels,h=m.heightPixels;
  if(down)swipe(w/2,h*0.75f,w/2,h*0.25f);else swipe(w/2,h*0.25f,w/2,h*0.75f);
 }
 static void closeApp(){
  if(inst==null)return;
  inst.performGlobalAction(GLOBAL_ACTION_RECENTS);
  H.postDelayed(()->{if(inst==null)return;DisplayMetrics m=inst.getResources().getDisplayMetrics();swipe(m.widthPixels/2f,m.heightPixels*0.55f,m.widthPixels/2f,m.heightPixels*0.08f);},900);
  H.postDelayed(()->global(GLOBAL_ACTION_HOME),1800);
 }
 static void clickLater(String labels,long d){tryClick(labels,d,3);}
 static void tryClick(String labels,long d,int n){
  H.postDelayed(()->{
   if(inst==null)return;
   boolean ok=false;
   AccessibilityNodeInfo r=inst.getRootInActiveWindow();
   if(r!=null)for(String l:labels.split("[|]")){
    List<AccessibilityNodeInfo> L=r.findAccessibilityNodeInfosByText(l);
    for(AccessibilityNodeInfo nd:L){
     if(nd.isEditable())continue;
     AccessibilityNodeInfo p=nd;
     while(p!=null&&!p.isClickable())p=p.getParent();
     if(p!=null&&p.performAction(AccessibilityNodeInfo.ACTION_CLICK)){ok=true;break;}
    }
    if(ok)break;
   }
   if(!ok&&n>1)tryClick(labels,1500,n-1);
  },d);
 }
}`);
fs.writeFileSync(J+'PhoneControlPlugin.java',String.raw`package com.mpro.ai;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import android.accessibilityservice.AccessibilityService;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
@CapacitorPlugin(name="PhoneControl")
public class PhoneControlPlugin extends Plugin {
 private void go(Intent i){i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);getContext().startActivity(i);}
 private String num(String q){
  if(q==null||q.isEmpty())return null;
  String n=null;
  if(q.matches("[+0-9 ()-]+")){n=q.replaceAll("[ ()-]","");}
  else{
   try(Cursor c=getContext().getContentResolver().query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI,new String[]{ContactsContract.CommonDataKinds.Phone.NUMBER},ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME+" LIKE ?",new String[]{"%"+q+"%"},null)){
    if(c!=null&&c.moveToFirst())n=c.getString(0).replaceAll("[ ()-]","");
   }catch(Exception e){}
  }
  return n;
 }
 private boolean need(JSObject r){
  if(PhoneAccessibilityService.on())return false;
  r.put("ok",false);r.put("error","Accessibility is off. Ask the user to tap Enable phone control in Settings and turn on MPro AI.");
  return true;
 }
 @PluginMethod
 public void run(PluginCall c){
  String a=c.getString("action",""),t=c.getString("target",""),x=c.getString("text",""),s=c.getString("subject","");
  JSObject r=new JSObject();
  r.put("ok",true);
  try{
   switch(a){
    case "openApp":{
     PackageManager pm=getContext().getPackageManager();String q=t.toLowerCase();Intent li=null;
     for(ApplicationInfo ai:pm.getInstalledApplications(0)){
      String lb=String.valueOf(pm.getApplicationLabel(ai)).toLowerCase();
      if(!q.isEmpty()&&lb.contains(q)){li=pm.getLaunchIntentForPackage(ai.packageName);if(li!=null)break;}
     }
     if(li==null){r.put("ok",false);r.put("error","app not found: "+t);}else go(li);
     break;}
    case "call":{
     String n=num(t);
     if(n==null){r.put("ok",false);r.put("error","contact not found: "+t);}
     else{
      boolean g=getContext().checkSelfPermission(android.Manifest.permission.CALL_PHONE)==PackageManager.PERMISSION_GRANTED;
      go(new Intent(g?Intent.ACTION_CALL:Intent.ACTION_DIAL,Uri.parse("tel:"+n)));
     }
     break;}
    case "whatsapp":{
     String n=num(t);
     if(n==null){r.put("ok",false);r.put("error","contact not found: "+t);break;}
     n=n.replace("+","");
     if(n.length()==10)n="91"+n;
     Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("https://wa.me/"+n+"?text="+Uri.encode(x)));
     i.setPackage("com.whatsapp");go(i);
     PhoneAccessibilityService.clickLater("Send",2500);
     r.put("autoSend",PhoneAccessibilityService.on());
     break;}
    case "email":{
     Intent i=new Intent(Intent.ACTION_SENDTO,Uri.parse("mailto:"));
     i.putExtra(Intent.EXTRA_EMAIL,new String[]{t});i.putExtra(Intent.EXTRA_SUBJECT,s);i.putExtra(Intent.EXTRA_TEXT,x);
     go(i);PhoneAccessibilityService.clickLater("Send",2500);
     r.put("autoSend",PhoneAccessibilityService.on());
     break;}
    case "photo":
     go(new Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA));
     PhoneAccessibilityService.clickLater("Shutter|Take photo|Capture",2500);
     break;
    case "youtube":{
     Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("https://www.youtube.com/results?search_query="+Uri.encode(t)));
     i.setPackage("com.google.android.youtube");go(i);
     break;}
    case "scrollDown":if(!need(r))PhoneAccessibilityService.scroll(true);break;
    case "scrollUp":if(!need(r))PhoneAccessibilityService.scroll(false);break;
    case "back":if(!need(r))PhoneAccessibilityService.global(AccessibilityService.GLOBAL_ACTION_BACK);break;
    case "home":if(!need(r))PhoneAccessibilityService.global(AccessibilityService.GLOBAL_ACTION_HOME);break;
    case "recents":if(!need(r))PhoneAccessibilityService.global(AccessibilityService.GLOBAL_ACTION_RECENTS);break;
    case "notifications":if(!need(r))PhoneAccessibilityService.global(AccessibilityService.GLOBAL_ACTION_NOTIFICATIONS);break;
    case "closeApp":if(!need(r))PhoneAccessibilityService.closeApp();break;
    case "tap":if(!need(r))PhoneAccessibilityService.clickLater(t,0);break;
    case "accessibility":go(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));break;
    default:r.put("ok",false);r.put("error","unknown action");
   }
  }catch(Exception e){r.put("ok",false);r.put("error",String.valueOf(e.getMessage()));}
  c.resolve(r);
 }
}`);
fs.writeFileSync(R+'xml/accessibility_service_config.xml',`<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
 android:accessibilityEventTypes="typeWindowStateChanged"
 android:accessibilityFeedbackType="feedbackGeneric"
 android:canPerformGestures="true"
 android:canRetrieveWindowContent="true"
 android:description="@string/a11y_desc"
 android:notificationTimeout="100"/>`);
const sp=R+'values/strings.xml';let st=fs.readFileSync(sp,'utf8');
if(!st.includes('a11y_desc'))fs.writeFileSync(sp,st.replace('</resources>','<string name="a11y_desc">MPro AI taps, scrolls and navigates your phone when you ask by voice.</string></resources>'));
let x=fs.readFileSync(M,'utf8');
for(const p of['RECORD_AUDIO','MODIFY_AUDIO_SETTINGS','CALL_PHONE','READ_CONTACTS','CAMERA','QUERY_ALL_PACKAGES'])
 if(!x.includes('permission.'+p))x=x.replace('<application','<uses-permission android:name="android.permission.'+p+'" />\n    <application');
if(!x.includes('PhoneAccessibilityService'))x=x.replace('</application>','<service android:name=".PhoneAccessibilityService" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" android:exported="true"><intent-filter><action android:name="android.accessibilityservice.AccessibilityService"/></intent-filter><meta-data android:name="android.accessibilityservice" android:resource="@xml/accessibility_service_config"/></service></application>');
fs.writeFileSync(M,x);console.log('native phone control patched');
