package com.lapiconera.proyecto.data.repository

import com.lapiconera.proyecto.data.api.ApiService
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.model.Categoria

class CategoriaRepository(
    private val api: ApiService = RetrofitClient.api
) {

    /**
     * Obtiene todas las categorías disponibles
     */
    suspend fun getCategorias(): Result<List<Categoria>> {
        return try {
            val response = api.getCategorias()

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al obtener categorías: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

