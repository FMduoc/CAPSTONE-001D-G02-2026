package com.gestion.solicitudes;

import android.os.Bundle;
import android.util.Log;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

  // static: se conserva aunque la actividad se recree
  private static long ultimoReinicio = 0;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    getBridge().addWebViewListener(new WebViewListener() {
      @Override
      public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
        Log.e("SGCP", "Renderer terminado. Falla propia: " + detail.didCrash());

        long ahora = System.currentTimeMillis();
        // Si ya reiniciamos hace menos de 10 s, no insistimos (evita un bucle)
        if (ahora - ultimoReinicio < 10000) {
          return false;
        }
        ultimoReinicio = ahora;

        // El WebView muerto no sirve: se recrea la actividad con uno nuevo
        runOnUiThread(() -> recreate());
        return true; // le indica a Android que lo manejamos, para que no cierre la app
      }
    });
  }
}