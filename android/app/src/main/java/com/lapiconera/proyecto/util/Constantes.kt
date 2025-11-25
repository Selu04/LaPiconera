package com.lapiconera.proyecto.util

object Constantes {
    const val PREFS_NAME = "prefs"
    const val USER_ID = "userId"

    // URLs del API
    // Para emulador de Android: 10.0.2.2 representa localhost de tu PC
    // Para dispositivo físico: usar la IP local de tu PC (ej: 192.168.1.X:3000)

    private const val USE_PRODUCTION = false // Cambiar a true cuando despliegues en producción

    private const val DEV_BASE_URL = "http://10.0.2.2:3000/api/" // Para emulador
    // private const val DEV_BASE_URL = "http://192.168.1.X:3000/api/" // Para dispositivo físico (reemplazar X con tu IP)

    private const val PROD_BASE_URL = "https://tu-api-produccion.com/api/" // Configurar cuando despliegues

    val BASE_URL = if (USE_PRODUCTION) PROD_BASE_URL else DEV_BASE_URL
}



