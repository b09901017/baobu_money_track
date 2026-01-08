package com.baobu.moneytrack;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin.class);
    }
}
