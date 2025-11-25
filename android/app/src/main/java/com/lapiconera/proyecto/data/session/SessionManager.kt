package com.lapiconera.proyecto.data.session

import android.content.Context

object SessionManager {
    fun saveToken(context: Context, token: String) {
        val prefs = context.getSharedPreferences("APP_PREFS", Context.MODE_PRIVATE)
        prefs.edit().putString("token", token).apply()
    }

    fun clearSession(context: Context) {
        val prefs = context.getSharedPreferences("APP_PREFS", Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }

    fun getToken(context: Context): String? {
        val prefs = context.getSharedPreferences("APP_PREFS", Context.MODE_PRIVATE)
        return prefs.getString("token", null)
    }
}
