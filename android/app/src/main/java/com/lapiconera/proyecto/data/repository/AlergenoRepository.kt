package com.lapiconera.proyecto.data.repository

import com.lapiconera.proyecto.data.api.ApiService
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.model.Alergeno

class AlergenoRepository(
    private val api: ApiService = RetrofitClient.api
) {

    suspend fun getAlergenos(): Result<List<Alergeno>> {
        return try {
            val response = api.getAlergenos()

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al obtener alérgenos: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

