package com.lapiconera.proyecto.util

object Constantes {
    const val PREFS_NAME = "prefs"
    const val USER_ID = "userId"

    private const val USE_PRODUCTION = true

    private const val DEV_BASE_URL = "http://10.0.2.2:3000/api/"

    private const val PROD_BASE_URL = "https://lapiconera.vercel.app/api/"

    val BASE_URL = if (USE_PRODUCTION) PROD_BASE_URL else DEV_BASE_URL
}



