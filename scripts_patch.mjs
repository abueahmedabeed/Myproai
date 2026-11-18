import fs from 'fs';const p='android/app/src/main/AndroidManifest.xml';let x=fs.readFileSync(p,'utf8');
for(const perm of['RECORD_AUDIO','MODIFY_AUDIO_SETTINGS'])if(!x.includes(perm))x=x.replace('<application',`<uses-permission android:name="android.permission.${perm}" />\n    <application`);
fs.writeFileSync(p,x);console.log('manifest patched');
