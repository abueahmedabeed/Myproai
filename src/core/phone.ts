import {registerPlugin,Capacitor} from '@capacitor/core';
const P=registerPlugin<{run(o:Record<string,any>):Promise<any>}>('PhoneControl');
export const native=()=>Capacitor.isNativePlatform();
export const phone=(o:Record<string,any>):Promise<any>=>native()?P.run(o):Promise.resolve({ok:false,error:'Phone control works only in the Android app'});
