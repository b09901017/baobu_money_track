import {
  Persistence,
  ProviderId,
  registerPlugin
} from "./chunk-HZCVXEAP.js";

// node_modules/@capacitor-firebase/authentication/dist/esm/index.js
var FirebaseAuthentication = registerPlugin("FirebaseAuthentication", {
  web: () => import("./web-GBAL5FOG.js").then((m) => new m.FirebaseAuthenticationWeb())
});
export {
  FirebaseAuthentication,
  Persistence,
  ProviderId
};
//# sourceMappingURL=@capacitor-firebase_authentication.js.map
